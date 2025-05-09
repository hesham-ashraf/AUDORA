import prisma from '../services/prismaClient.js';

// GET all albums with filtering and sorting
export const getAllAlbums = async (req, res) => {
  try {
    const {
      genre,
      artist,
      sortBy = 'title',
      sortOrder = 'asc',
      limit = 50,
      page = 1,
      featured = false
    } = req.query;

    // Calculate pagination values
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 100); // Cap at 100 items max
    const skip = (pageNum - 1) * limitNum;

    // Build where conditions for filtering
    const whereConditions = {};
    
    if (genre) {
      whereConditions.genre = {
        contains: genre,
        mode: 'insensitive'
      };
    }
    
    if (artist) {
      whereConditions.artist = {
        name: {
          contains: artist,
          mode: 'insensitive'
        }
      };
    }
    
    if (featured === 'true') {
      whereConditions.featured = true;
    }

    // Determine sort field and direction
    const orderBy = {};
    
    // Handle different sorting options
    switch (sortBy) {
      case 'title':
        orderBy.title = sortOrder.toLowerCase();
        break;
      case 'artist':
        orderBy.artist = { name: sortOrder.toLowerCase() };
        break;
      case 'releaseDate':
        orderBy.releaseDate = sortOrder.toLowerCase();
        break;
      case 'popularity':
      case 'playCount':
        orderBy.playCount = sortOrder.toLowerCase();
        break;
      default:
        orderBy.title = sortOrder.toLowerCase();
    }

    // Execute query with count
    const [albums, totalCount] = await Promise.all([
      prisma.album.findMany({
        where: whereConditions,
        include: { 
          artist: true,
          tracks: {
            select: {
              id: true,
              title: true,
              duration: true,
              trackNumber: true,
              audioUrl: true
            },
            orderBy: { trackNumber: 'asc' }
          },
          genres: true
        },
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.album.count({ where: whereConditions })
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limitNum);

    // Process cover images and add optimized URLs
    const albumsWithOptimizedAssets = albums.map(album => {
      // For the actual implementation, you'd handle image CDN resizing here
      // For example with Cloudinary, Imgix, or similar services
      const coverUrl = album.coverUrl;
      return {
        ...album,
        coverUrl,
        coverThumbnail: `${coverUrl}?w=200&h=200&fit=crop`, // Example of thumbnail size
        coverMedium: `${coverUrl}?w=400&h=400&fit=crop`,    // Example of medium size
        previewUrl: album.tracks.length > 0 ? `${album.tracks[0].audioUrl}?preview=true` : null,
      };
    });

    res.json({
      data: albumsWithOptimizedAssets,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching albums:', error);
    res.status(500).json({ error: 'Failed to fetch albums' });
  }
};

// GET trending albums
export const getTrendingAlbums = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const limitNum = Math.min(parseInt(limit), 50); // Cap at 50 items max
    
    const albums = await prisma.album.findMany({
      orderBy: { playCount: 'desc' },
      take: limitNum,
      include: { 
        artist: true,
        tracks: {
          select: {
            id: true,
            title: true,
            duration: true,
            audioUrl: true
          },
          take: 1 // Only include first track for preview
        }
      }
    });
    
    // Process for optimized assets
    const albumsWithOptimizedAssets = albums.map(album => {
      const coverUrl = album.coverUrl;
      return {
        ...album,
        coverUrl,
        coverThumbnail: `${coverUrl}?w=200&h=200&fit=crop`,
        previewUrl: album.tracks.length > 0 ? `${album.tracks[0].audioUrl}?preview=true` : null,
      };
    });
    
    res.json(albumsWithOptimizedAssets);
  } catch (error) {
    console.error('Error fetching trending albums:', error);
    res.status(500).json({ error: 'Failed to fetch trending albums' });
  }
};

// GET album by ID
export const getAlbumById = async (req, res) => {
  try {
    const albumId = parseInt(req.params.id);
    const album = await prisma.album.findUnique({
      where: { id: albumId },
      include: { 
        artist: true,
        genres: true,
        tracks: {
          orderBy: { trackNumber: 'asc' }
        }
      }
    });

    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }

    // Update play count
    await prisma.album.update({
      where: { id: albumId },
      data: { playCount: { increment: 1 } }
    });

    // Add optimization for cover images and audio previews
    const albumWithOptimizedAssets = {
      ...album,
      coverThumbnail: `${album.coverUrl}?w=200&h=200&fit=crop`,
      coverMedium: `${album.coverUrl}?w=400&h=400&fit=crop`,
      coverLarge: `${album.coverUrl}?w=800&h=800&fit=crop`,
      tracks: album.tracks.map(track => ({
        ...track,
        previewUrl: `${track.audioUrl}?preview=true`,
      }))
    };

    res.json(albumWithOptimizedAssets);
  } catch (error) {
    console.error('Error fetching album:', error);
    res.status(500).json({ error: 'Error fetching album' });
  }
};

// GET albums by genre
export const getAlbumsByGenre = async (req, res) => {
  try {
    const { genre } = req.params;
    const { limit = 20, page = 1 } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 50);
    const skip = (pageNum - 1) * limitNum;
    
    const [albums, totalCount] = await Promise.all([
      prisma.album.findMany({
        where: {
          genres: {
            some: {
              name: {
                equals: genre,
                mode: 'insensitive'
              }
            }
          }
        },
        include: {
          artist: true,
          tracks: {
            select: {
              id: true,
              title: true
            },
            take: 1
          },
          genres: true
        },
        skip,
        take: limitNum,
        orderBy: { playCount: 'desc' }
      }),
      prisma.album.count({
        where: {
          genres: {
            some: {
              name: {
                equals: genre,
                mode: 'insensitive'
              }
            }
          }
        }
      })
    ]);
    
    // Process for optimized assets
    const albumsWithOptimizedAssets = albums.map(album => {
      const coverUrl = album.coverUrl;
      return {
        ...album,
        coverUrl,
        coverThumbnail: `${coverUrl}?w=200&h=200&fit=crop`,
      };
    });
    
    res.json({
      data: albumsWithOptimizedAssets,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching albums by genre:', error);
    res.status(500).json({ error: 'Failed to fetch albums by genre' });
  }
};

// GET related albums
export const getRelatedAlbums = async (req, res) => {
  try {
    const albumId = parseInt(req.params.id);
    const { limit = 8 } = req.query;
    const limitNum = Math.min(parseInt(limit), 20);
    
    // Get the current album with genres
    const currentAlbum = await prisma.album.findUnique({
      where: { id: albumId },
      include: {
        genres: true,
        artist: true
      }
    });
    
    if (!currentAlbum) {
      return res.status(404).json({ error: 'Album not found' });
    }
    
    // Find albums with similar genres
    const genreIds = currentAlbum.genres.map(g => g.id);
    
    // First try to find albums with the same artist
    let relatedAlbums = await prisma.album.findMany({
      where: {
        id: { not: albumId },
        artist: { id: currentAlbum.artist.id }
      },
      include: {
        artist: true,
        tracks: { take: 1 }
      },
      take: limitNum / 2
    });
    
    // Then find albums with similar genres
    const genreBasedAlbums = await prisma.album.findMany({
      where: {
        id: { not: albumId },
        artist: { id: { not: currentAlbum.artist.id } },
        genres: {
          some: {
            id: { in: genreIds }
          }
        }
      },
      include: {
        artist: true,
        tracks: { take: 1 }
      },
      take: limitNum - relatedAlbums.length
    });
    
    relatedAlbums = [...relatedAlbums, ...genreBasedAlbums];
    
    // Process for optimized assets
    const albumsWithOptimizedAssets = relatedAlbums.map(album => {
      const coverUrl = album.coverUrl;
      return {
        ...album,
        coverUrl,
        coverThumbnail: `${coverUrl}?w=200&h=200&fit=crop`,
      };
    });
    
    res.json(albumsWithOptimizedAssets);
  } catch (error) {
    console.error('Error fetching related albums:', error);
    res.status(500).json({ error: 'Failed to fetch related albums' });
  }
};

// DELETE album by ID
export const deleteAlbum = async (req, res) => {
  try {
    const albumId = parseInt(req.params.id);

    const deleted = await prisma.album.delete({
      where: { id: albumId }
    });

    res.json({ message: 'Album deleted', deleted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete album' });
  }
};

// UPDATE album by ID
export const updateAlbum = async (req, res) => {
  try {
    const albumId = parseInt(req.params.id);
    const { title, artistId, coverUrl, genre, releaseDate, tracks } = req.body;

    const updated = await prisma.album.update({
      where: { id: albumId },
      data: {
        ...(title && { title }),
        ...(artistId && { artist: { connect: { id: artistId } } }),
        ...(coverUrl && { coverUrl }),
        ...(genre && { genre }),
        ...(releaseDate && { releaseDate: new Date(releaseDate) })
      },
      include: {
        artist: true,
        tracks: true
      }
    });

    // If tracks are provided, update them
    if (tracks && Array.isArray(tracks)) {
      // Handle track updates in a transaction
      await prisma.$transaction(
        tracks.map(track => 
          prisma.track.upsert({
            where: { 
              id: track.id || -1 // Use -1 for new tracks
            },
            create: {
              title: track.title,
              duration: track.duration || 0,
              audioUrl: track.audioUrl || '',
              trackNumber: track.trackNumber,
              album: { connect: { id: albumId } }
            },
            update: {
              title: track.title,
              duration: track.duration,
              audioUrl: track.audioUrl,
              trackNumber: track.trackNumber
            }
          })
        )
      );
      
      // Fetch updated album with tracks
      const refreshedAlbum = await prisma.album.findUnique({
        where: { id: albumId },
        include: {
          artist: true,
          tracks: {
            orderBy: { trackNumber: 'asc' }
          }
        }
      });
      
      res.json(refreshedAlbum);
    } else {
      res.json(updated);
    }
  } catch (error) {
    console.error('Error updating album:', error);
    res.status(500).json({ error: 'Failed to update album' });
  }
};

// POST create new album
export const createAlbum = async (req, res) => {
  try {
    const { title, artistId, coverUrl, genre, releaseDate, tracks = [] } = req.body;

    // Validate required fields
    if (!title || !artistId) {
      return res.status(400).json({ error: 'Title and artist are required' });
    }

    const newAlbum = await prisma.album.create({
      data: {
        title,
        artist: { connect: { id: parseInt(artistId) } },
        coverUrl: coverUrl || 'https://via.placeholder.com/300x300?text=Album+Cover',
        genre: genre || 'Unknown',
        releaseDate: releaseDate ? new Date(releaseDate) : new Date(),
        playCount: 0,
        tracks: {
          create: tracks.map((track, index) => ({
            title: track.title,
            duration: track.duration || 0,
            audioUrl: track.audioUrl || '',
            trackNumber: track.trackNumber || index + 1
          }))
        }
      },
      include: { 
        artist: true,
        tracks: {
          orderBy: { trackNumber: 'asc' }
        }
      }
    });

    res.status(201).json(newAlbum);
  } catch (error) {
    console.error('Error creating album:', error);
    res.status(500).json({ error: 'Failed to create album' });
  }
};

// GET all genres
export const getAllGenres = async (req, res) => {
  try {
    const genres = await prisma.genre.findMany({
      orderBy: { name: 'asc' }
    });
    
    res.json(genres);
  } catch (error) {
    console.error('Error fetching genres:', error);
    res.status(500).json({ error: 'Failed to fetch genres' });
  }
};

// Record album play
export const recordAlbumPlay = async (req, res) => {
  try {
    const albumId = parseInt(req.params.id);
    
    await prisma.album.update({
      where: { id: albumId },
      data: { playCount: { increment: 1 } }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error recording play:', error);
    res.status(500).json({ error: 'Failed to record play' });
  }
};
