import prisma from '../services/prismaClient.js';

/**
 * Search across all content types (albums, tracks, artists, podcasts)
 * @route GET /api/search
 */
export const searchContent = async (req, res) => {
  try {
    const { query, type, limit = 10 } = req.query;
    
    if (!query || query.length < 2) {
      return res.status(400).json({ 
        error: 'Search query must be at least 2 characters long' 
      });
    }

    const resultsLimit = Math.min(parseInt(limit) || 10, 20); // Cap at 20 max
    let results = {};
    
    // Use raw SQL for better fuzzy matching if needed
    const fuzzyPattern = `%${query}%`;
    
    // If type is specified, only search that content type
    if (type) {
      switch (type.toLowerCase()) {
        case 'albums':
          results = { albums: await searchAlbums(query, fuzzyPattern, resultsLimit) };
          break;
        case 'tracks':
          results = { tracks: await searchTracks(query, fuzzyPattern, resultsLimit) };
          break;
        case 'artists':
          results = { artists: await searchArtists(query, fuzzyPattern, resultsLimit) };
          break;
        case 'podcasts':
          results = { podcasts: await searchPodcasts(query, fuzzyPattern, resultsLimit) };
          break;
        default:
          return res.status(400).json({ error: 'Invalid search type' });
      }
    } else {
      // Search all content types with smaller limits per type
      const perTypeLimit = Math.max(3, Math.floor(resultsLimit / 4));
      
      // Execute searches in parallel for better performance
      const [albums, tracks, artists, podcasts] = await Promise.all([
        searchAlbums(query, fuzzyPattern, perTypeLimit),
        searchTracks(query, fuzzyPattern, perTypeLimit),
        searchArtists(query, fuzzyPattern, perTypeLimit),
        searchPodcasts(query, fuzzyPattern, perTypeLimit)
      ]);
      
      results = { albums, tracks, artists, podcasts };
    }
    
    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'An error occurred while searching' });
  }
};

/**
 * Get autocomplete suggestions based on partial input
 * @route GET /api/search/autocomplete
 */
export const getAutocompleteSuggestions = async (req, res) => {
  try {
    const { query, limit = 5 } = req.query;
    
    if (!query || query.length < 2) {
      return res.json({ suggestions: [] });
    }

    const resultsLimit = Math.min(parseInt(limit) || 5, 10); // Cap at 10 max
    const fuzzyPattern = `${query}%`; // Starts with pattern for better autocomplete
    
    // Get suggestions from various sources
    const [albumTitles, artistNames, trackTitles, podcastTitles] = await Promise.all([
      prisma.album.findMany({
        where: { title: { startsWith: query, mode: 'insensitive' } },
        select: { title: true },
        take: resultsLimit,
        orderBy: { playCount: 'desc' }
      }),
      prisma.artist.findMany({
        where: { name: { startsWith: query, mode: 'insensitive' } },
        select: { name: true },
        take: resultsLimit,
        orderBy: { albums: { _count: 'desc' } }
      }),
      prisma.track.findMany({
        where: { title: { startsWith: query, mode: 'insensitive' } },
        select: { title: true },
        take: resultsLimit,
        orderBy: { playCount: 'desc' }
      }),
      prisma.podcast.findMany({
        where: { title: { startsWith: query, mode: 'insensitive' } },
        select: { title: true },
        take: resultsLimit,
        orderBy: { listenCount: 'desc' }
      })
    ]);
    
    // Extract unique suggestions
    const suggestions = [
      ...albumTitles.map(item => ({ text: item.title, type: 'album' })),
      ...artistNames.map(item => ({ text: item.name, type: 'artist' })),
      ...trackTitles.map(item => ({ text: item.title, type: 'track' })),
      ...podcastTitles.map(item => ({ text: item.title, type: 'podcast' }))
    ];
    
    // Deduplicate and sort by relevance/popularity
    const uniqueSuggestions = Array.from(
      new Map(suggestions.map(item => [item.text.toLowerCase(), item])).values()
    )
    .slice(0, resultsLimit);
    
    res.json({ suggestions: uniqueSuggestions });
  } catch (error) {
    console.error('Autocomplete error:', error);
    res.status(500).json({ error: 'An error occurred while getting suggestions' });
  }
};

/**
 * Get search history for a user
 * @route GET /api/search/history
 */
export const getSearchHistory = async (req, res) => {
  try {
    const { userId } = req;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const searchHistory = await prisma.searchHistory.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { timestamp: 'desc' },
      take: 10
    });
    
    res.json({ history: searchHistory });
  } catch (error) {
    console.error('Search history error:', error);
    res.status(500).json({ error: 'An error occurred while retrieving search history' });
  }
};

/**
 * Save a search query to history
 * @route POST /api/search/history
 */
export const saveSearchHistory = async (req, res) => {
  try {
    const { userId } = req;
    const { query } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Invalid search query' });
    }
    
    // Upsert to avoid duplicates
    const result = await prisma.searchHistory.upsert({
      where: {
        userId_query: {
          userId: parseInt(userId),
          query
        }
      },
      update: {
        timestamp: new Date()
      },
      create: {
        userId: parseInt(userId),
        query,
        timestamp: new Date()
      }
    });
    
    res.json({ success: true, item: result });
  } catch (error) {
    console.error('Save search history error:', error);
    res.status(500).json({ error: 'An error occurred while saving search history' });
  }
};

/**
 * Clear search history for a user
 * @route DELETE /api/search/history
 */
export const clearSearchHistory = async (req, res) => {
  try {
    const { userId } = req;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    await prisma.searchHistory.deleteMany({
      where: { userId: parseInt(userId) }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Clear search history error:', error);
    res.status(500).json({ error: 'An error occurred while clearing search history' });
  }
};

// Helper functions for searching different content types

async function searchAlbums(query, fuzzyPattern, limit) {
  return await prisma.album.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { artist: { name: { contains: query, mode: 'insensitive' } } },
        { genre: { contains: query, mode: 'insensitive' } }
      ]
    },
    include: {
      artist: true,
      tracks: { take: 1 }
    },
    take: limit,
    orderBy: [
      { playCount: 'desc' },
      { title: 'asc' }
    ]
  });
}

async function searchTracks(query, fuzzyPattern, limit) {
  return await prisma.track.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { album: { title: { contains: query, mode: 'insensitive' } } },
        { album: { artist: { name: { contains: query, mode: 'insensitive' } } } }
      ]
    },
    include: {
      album: {
        include: { artist: true }
      }
    },
    take: limit,
    orderBy: [
      { playCount: 'desc' },
      { title: 'asc' }
    ]
  });
}

async function searchArtists(query, fuzzyPattern, limit) {
  return await prisma.artist.findMany({
    where: {
      name: { contains: query, mode: 'insensitive' }
    },
    include: {
      _count: {
        select: { albums: true }
      }
    },
    take: limit,
    orderBy: [
      { albums: { _count: 'desc' } },
      { name: 'asc' }
    ]
  });
}

async function searchPodcasts(query, fuzzyPattern, limit) {
  return await prisma.podcast.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { host: { name: { contains: query, mode: 'insensitive' } } },
        { description: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } }
      ]
    },
    include: {
      host: true,
      episodes: { take: 1 }
    },
    take: limit,
    orderBy: [
      { listenCount: 'desc' },
      { title: 'asc' }
    ]
  });
} 