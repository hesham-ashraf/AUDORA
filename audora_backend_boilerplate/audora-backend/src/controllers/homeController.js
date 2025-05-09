import prisma from '../services/prismaClient.js';
import { calculateSimilarity } from '../utils/recommendationUtils.js';

// Get personalized home page content
export const getHomeContent = async (req, res) => {
  try {
    const { userId } = req.query;
    let personalizedContent = {};
    
    // 1. Fetch trending content (non-personalized)
    const trendingAlbums = await prisma.album.findMany({
      take: 5,
      orderBy: [
        { playCount: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        artist: true,
        tracks: { take: 1 }
      }
    });
    
    const trendingPodcasts = await prisma.podcast.findMany({
      take: 5,
      orderBy: [
        { listenCount: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        host: true,
        episodes: { take: 1 }
      }
    });
    
    const trending = [...trendingAlbums, ...trendingPodcasts].sort((a, b) => {
      const aCount = a.playCount || a.listenCount || 0;
      const bCount = b.playCount || b.listenCount || 0;
      return bCount - aCount;
    }).slice(0, 5);
    
    // 2. Get new releases
    const newReleases = await prisma.album.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        artist: true,
        tracks: { take: 1 }
      }
    });
    
    // 3. Get popular podcasts
    const popularPodcasts = await prisma.podcast.findMany({
      take: 5,
      orderBy: { listenCount: 'desc' },
      include: {
        host: true,
        episodes: { take: 1 }
      }
    });
    
    // If user is logged in, get personalized recommendations
    if (userId) {
      // Retrieve user data for personalization
      const user = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
        include: {
          playHistory: {
            take: 20,
            orderBy: { playedAt: 'desc' },
            include: {
              track: {
                include: { album: true }
              }
            }
          },
          likedTracks: {
            include: {
              track: {
                include: { album: true }
              }
            }
          },
          likedAlbums: {
            include: {
              album: true
            }
          }
        }
      });
      
      if (user) {
        // Get genres the user listens to most
        const userGenres = new Map();
        
        // Add genres from play history
        user.playHistory.forEach(history => {
          const genre = history.track?.album?.genre;
          if (genre) {
            userGenres.set(genre, (userGenres.get(genre) || 0) + 1);
          }
        });
        
        // Add genres from liked tracks
        user.likedTracks.forEach(liked => {
          const genre = liked.track?.album?.genre;
          if (genre) {
            userGenres.set(genre, (userGenres.get(genre) || 0) + 1);
          }
        });
        
        // Add genres from liked albums
        user.likedAlbums.forEach(liked => {
          const genre = liked.album?.genre;
          if (genre) {
            userGenres.set(genre, (userGenres.get(genre) || 0) + 2); // Give more weight to explicitly liked albums
          }
        });
        
        // Sort genres by count
        const topGenres = [...userGenres.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(entry => entry[0]);
        
        // Get recommendations based on top genres
        if (topGenres.length > 0) {
          const genreRecommendations = await prisma.album.findMany({
            where: {
              genre: { in: topGenres },
              id: {
                notIn: user.likedAlbums.map(liked => liked.albumId) // Exclude already liked albums
              }
            },
            take: 10,
            include: {
              artist: true,
              tracks: { take: 1 }
            }
          });
          
          personalizedContent.recommendedForYou = genreRecommendations;
        }
        
        // Get recommendations based on listening history (collaborative filtering)
        const recentlyPlayedArtists = new Set(
          user.playHistory
            .map(history => history.track?.album?.artistId)
            .filter(Boolean)
        );
        
        if (recentlyPlayedArtists.size > 0) {
          const artistRecommendations = await prisma.album.findMany({
            where: {
              artistId: { in: [...recentlyPlayedArtists] },
              id: {
                notIn: user.playHistory
                  .map(history => history.track?.albumId)
                  .filter(Boolean)
              }
            },
            take: 5,
            include: {
              artist: true,
              tracks: { take: 1 }
            }
          });
          
          personalizedContent.moreLikeRecentlyPlayed = artistRecommendations;
        }
        
        // Get popular among similar users (precomputed)
        // This would typically be a more complex calculation done in a scheduled job
        // For this example, we're simplifying and doing it on-demand
        const similarUserRecommendations = await getPrecomputedRecommendations(userId);
        if (similarUserRecommendations.length > 0) {
          personalizedContent.popularWithSimilarListeners = similarUserRecommendations;
        }
      }
    }
    
    // Combine all content for the response
    const response = {
      trending,
      newReleases,
      popularPodcasts,
      ...personalizedContent
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error getting home content:', error);
    res.status(500).json({ error: 'Failed to get home content' });
  }
};

// Function to get precomputed recommendations
// In a real system, these would be calculated by a scheduled job and stored
async function getPrecomputedRecommendations(userId) {
  try {
    // In a real implementation, you would retrieve precomputed recommendations
    // Here's a simplified version that mimics what a precomputation would do
    
    // 1. Get current user's favorites
    const userFavorites = await prisma.likedTrack.findMany({
      where: { userId: parseInt(userId) },
      select: { trackId: true }
    });
    
    if (userFavorites.length === 0) {
      return [];
    }
    
    const userTrackIds = userFavorites.map(fav => fav.trackId);
    
    // 2. Find similar users (those who liked similar tracks)
    const similarUsers = await prisma.likedTrack.findMany({
      where: {
        trackId: { in: userTrackIds },
        userId: { not: parseInt(userId) }
      },
      select: { userId: true },
      distinct: ['userId']
    });
    
    if (similarUsers.length === 0) {
      return [];
    }
    
    const similarUserIds = similarUsers.map(u => u.userId);
    
    // 3. Get tracks that similar users liked but current user hasn't yet
    const recommendations = await prisma.track.findMany({
      where: {
        likes: {
          some: {
            userId: { in: similarUserIds }
          },
          none: {
            userId: parseInt(userId)
          }
        }
      },
      take: 10,
      include: {
        album: {
          include: { artist: true }
        }
      },
      orderBy: {
        likes: { _count: 'desc' }
      }
    });
    
    return recommendations;
  } catch (error) {
    console.error('Error getting precomputed recommendations:', error);
    return [];
  }
}

// Record user interaction for improving recommendations
export const recordInteraction = async (req, res) => {
  try {
    const { userId, itemId, itemType, interactionType } = req.body;
    
    if (!userId || !itemId || !itemType || !interactionType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Save the interaction
    const interaction = await prisma.userInteraction.create({
      data: {
        userId: parseInt(userId),
        itemId: parseInt(itemId),
        itemType, // 'track', 'album', 'podcast', etc.
        interactionType, // 'play', 'like', 'share', etc.
        timestamp: new Date()
      }
    });
    
    // Update play counts if it's a play interaction
    if (interactionType === 'play') {
      if (itemType === 'track') {
        await prisma.track.update({
          where: { id: parseInt(itemId) },
          data: { playCount: { increment: 1 } }
        });
      } else if (itemType === 'album') {
        await prisma.album.update({
          where: { id: parseInt(itemId) },
          data: { playCount: { increment: 1 } }
        });
      } else if (itemType === 'podcast') {
        await prisma.podcast.update({
          where: { id: parseInt(itemId) },
          data: { listenCount: { increment: 1 } }
        });
      }
    }
    
    res.json({ success: true, interaction });
  } catch (error) {
    console.error('Error recording interaction:', error);
    res.status(500).json({ error: 'Failed to record interaction' });
  }
};

// Get trending content (non-personalized)
export const getTrending = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const trendingAlbums = await prisma.album.findMany({
      take: parseInt(limit),
      orderBy: [
        { playCount: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        artist: true,
        tracks: { take: 1 }
      }
    });
    
    const trendingPodcasts = await prisma.podcast.findMany({
      take: parseInt(limit),
      orderBy: [
        { listenCount: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        host: true,
        episodes: { take: 1 }
      }
    });
    
    // Combine and sort by popularity
    const trending = [...trendingAlbums, ...trendingPodcasts].sort((a, b) => {
      const aCount = a.playCount || a.listenCount || 0;
      const bCount = b.playCount || b.listenCount || 0;
      return bCount - aCount;
    }).slice(0, parseInt(limit));
    
    res.json(trending);
  } catch (error) {
    console.error('Error getting trending content:', error);
    res.status(500).json({ error: 'Failed to get trending content' });
  }
}; 