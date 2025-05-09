import prisma from '../services/prismaClient.js';

// GET all podcasts with filtering, sorting and pagination
export const getAllPodcasts = async (req, res) => {
  try {
    const {
      category,
      host,
      sortBy = 'title',
      sortOrder = 'asc',
      page = 1,
      limit = 20,
      featured = false
    } = req.query;

    // Calculate pagination values
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 50); // Cap at 50 max
    const skip = (pageNum - 1) * limitNum;

    // Build where conditions for filtering
    const whereConditions = {};
    
    if (category) {
      whereConditions.categories = {
        some: {
          name: {
            contains: category,
            mode: 'insensitive'
          }
        }
      };
    }
    
    if (host) {
      whereConditions.host = {
        name: {
          contains: host,
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
      case 'releaseDate':
        orderBy.releaseDate = sortOrder.toLowerCase();
        break;
      case 'popularity':
        orderBy.listenCount = sortOrder.toLowerCase();
        break;
      default:
        orderBy.title = sortOrder.toLowerCase();
    }

    // Execute query with count
    const [podcasts, totalCount] = await Promise.all([
      prisma.podcast.findMany({
        where: whereConditions,
        include: { 
          host: true,
          categories: true,
          episodes: {
            take: 1,
            orderBy: { releaseDate: 'desc' }
          },
          _count: {
            select: { episodes: true }
          }
        },
        orderBy,
        skip,
        take: limitNum
      }),
      prisma.podcast.count({ where: whereConditions })
    ]);

    // Process data for response
    const processedPodcasts = podcasts.map(podcast => ({
      ...podcast,
      episodeCount: podcast._count.episodes,
      latestEpisode: podcast.episodes[0] || null,
      // Add image thumbnail for optimized loading
      coverThumbnail: `${podcast.coverUrl}?w=200&h=200&fit=crop`,
      // Remove unnecessary data
      _count: undefined
    }));

    res.json({
      data: processedPodcasts,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching podcasts:', error);
    res.status(500).json({ error: 'Failed to fetch podcasts' });
  }
};

// GET trending podcasts
export const getTrendingPodcasts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const limitNum = Math.min(parseInt(limit), 20);
    
    const podcasts = await prisma.podcast.findMany({
      where: { 
        episodes: { some: {} } // Only podcasts with episodes
      },
      orderBy: { listenCount: 'desc' },
      take: limitNum,
      include: {
        host: true,
        categories: true,
        episodes: {
          take: 1,
          orderBy: { releaseDate: 'desc' }
        },
        _count: {
          select: { episodes: true }
        }
      }
    });
    
    const processedPodcasts = podcasts.map(podcast => ({
      ...podcast,
      episodeCount: podcast._count.episodes,
      coverThumbnail: `${podcast.coverUrl}?w=200&h=200&fit=crop`,
      _count: undefined
    }));
    
    res.json(processedPodcasts);
  } catch (error) {
    console.error('Error fetching trending podcasts:', error);
    res.status(500).json({ error: 'Failed to fetch trending podcasts' });
  }
};

// GET user subscribed podcasts
export const getUserSubscriptions = async (req, res) => {
  try {
    const { userId } = req;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const subscriptions = await prisma.podcastSubscription.findMany({
      where: { userId: parseInt(userId) },
      include: { 
        podcast: {
          include: {
            host: true,
            categories: true,
            episodes: {
              take: 1,
              orderBy: { releaseDate: 'desc' }
            },
            _count: { 
              select: { episodes: true } 
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    const processedSubscriptions = subscriptions.map(sub => ({
      ...sub,
      podcast: {
        ...sub.podcast,
        episodeCount: sub.podcast._count.episodes,
        coverThumbnail: `${sub.podcast.coverUrl}?w=200&h=200&fit=crop`,
        _count: undefined
      }
    }));
    
    res.json(processedSubscriptions);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
};

// GET single podcast by ID with episodes
export const getPodcastById = async (req, res) => {
  try {
    const podcastId = parseInt(req.params.id);
    const { userId } = req;
    
    const podcast = await prisma.podcast.findUnique({
      where: { id: podcastId },
      include: { 
        host: true,
        categories: true,
        episodes: {
          orderBy: { releaseDate: 'desc' }
        }
      }
    });

    if (!podcast) {
      return res.status(404).json({ error: 'Podcast not found' });
    }
    
    // Check if user is subscribed
    let isSubscribed = false;
    if (userId) {
      const subscription = await prisma.podcastSubscription.findUnique({
        where: {
          userId_podcastId: {
            userId: parseInt(userId),
            podcastId
          }
        }
      });
      
      isSubscribed = !!subscription;
    }
    
    // Update view count
    await prisma.podcast.update({
      where: { id: podcastId },
      data: { viewCount: { increment: 1 } }
    });
    
    // Get user's episode progress if authenticated
    let episodesProgress = [];
    if (userId) {
      episodesProgress = await prisma.userEpisodeProgress.findMany({
        where: {
          userId: parseInt(userId),
          episode: {
            podcastId
          }
        }
      });
    }
    
    // Process episodes with progress data
    const processedEpisodes = podcast.episodes.map(episode => {
      const progress = episodesProgress.find(p => p.episodeId === episode.id);
      
      return {
        ...episode,
        progress: progress ? {
          currentTime: progress.currentTime,
          duration: progress.duration,
          completed: progress.completed,
          percentage: progress.duration > 0 ? Math.round((progress.currentTime / progress.duration) * 100) : 0
        } : null
      };
    });
    
    // Process podcast with optimized assets
    const processedPodcast = {
      ...podcast,
      coverThumbnail: `${podcast.coverUrl}?w=200&h=200&fit=crop`,
      coverMedium: `${podcast.coverUrl}?w=400&h=400&fit=crop`,
      episodes: processedEpisodes,
      isSubscribed
    };

    res.json(processedPodcast);
  } catch (error) {
    console.error('Error fetching podcast:', error);
    res.status(500).json({ error: 'Error fetching podcast' });
  }
};

// GET episode details by ID
export const getEpisodeById = async (req, res) => {
  try {
    const episodeId = parseInt(req.params.id);
    const { userId } = req;
    
    const episode = await prisma.episode.findUnique({
      where: { id: episodeId },
      include: {
        podcast: {
          include: {
            host: true,
            categories: true
          }
        }
      }
    });
    
    if (!episode) {
      return res.status(404).json({ error: 'Episode not found' });
    }
    
    // Get user's progress if authenticated
    let progress = null;
    if (userId) {
      const userProgress = await prisma.userEpisodeProgress.findUnique({
        where: {
          userId_episodeId: {
            userId: parseInt(userId),
            episodeId
          }
        }
      });
      
      if (userProgress) {
        progress = {
          currentTime: userProgress.currentTime,
          duration: userProgress.duration,
          completed: userProgress.completed,
          percentage: userProgress.duration > 0 ? Math.round((userProgress.currentTime / userProgress.duration) * 100) : 0
        };
      }
    }
    
    // Update play count
    await prisma.episode.update({
      where: { id: episodeId },
      data: { playCount: { increment: 1 } }
    });
    
    const processedEpisode = {
      ...episode,
      progress,
      podcast: {
        ...episode.podcast,
        coverThumbnail: `${episode.podcast.coverUrl}?w=200&h=200&fit=crop`
      }
    };
    
    res.json(processedEpisode);
  } catch (error) {
    console.error('Error fetching episode:', error);
    res.status(500).json({ error: 'Error fetching episode' });
  }
};

// POST subscribe to a podcast
export const subscribeToPodcast = async (req, res) => {
  try {
    const { userId } = req;
    const podcastId = parseInt(req.params.id);
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Check if podcast exists
    const podcast = await prisma.podcast.findUnique({
      where: { id: podcastId }
    });
    
    if (!podcast) {
      return res.status(404).json({ error: 'Podcast not found' });
    }
    
    // Create or update subscription
    const subscription = await prisma.podcastSubscription.upsert({
      where: {
        userId_podcastId: {
          userId: parseInt(userId),
          podcastId
        }
      },
      update: {
        notifications: req.body.notifications || true
      },
      create: {
        userId: parseInt(userId),
        podcastId,
        notifications: req.body.notifications || true
      }
    });
    
    res.json({ success: true, subscription });
  } catch (error) {
    console.error('Error subscribing to podcast:', error);
    res.status(500).json({ error: 'Failed to subscribe to podcast' });
  }
};

// DELETE unsubscribe from a podcast
export const unsubscribeFromPodcast = async (req, res) => {
  try {
    const { userId } = req;
    const podcastId = parseInt(req.params.id);
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Delete subscription
    await prisma.podcastSubscription.delete({
      where: {
        userId_podcastId: {
          userId: parseInt(userId),
          podcastId
        }
      }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error unsubscribing from podcast:', error);
    res.status(500).json({ error: 'Failed to unsubscribe from podcast' });
  }
};

// POST update episode progress
export const updateEpisodeProgress = async (req, res) => {
  try {
    const { userId } = req;
    const episodeId = parseInt(req.params.id);
    const { currentTime, duration, completed } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (currentTime === undefined || duration === undefined) {
      return res.status(400).json({ error: 'Current time and duration are required' });
    }
    
    // Update or create progress
    const progress = await prisma.userEpisodeProgress.upsert({
      where: {
        userId_episodeId: {
          userId: parseInt(userId),
          episodeId
        }
      },
      update: {
        currentTime,
        duration,
        completed: completed || (currentTime / duration >= 0.9), // Mark as completed if 90% listened
        updatedAt: new Date()
      },
      create: {
        userId: parseInt(userId),
        episodeId,
        currentTime,
        duration,
        completed: completed || (currentTime / duration >= 0.9)
      }
    });
    
    // Update listen count for the podcast
    const episode = await prisma.episode.findUnique({
      where: { id: episodeId },
      select: { podcastId: true }
    });
    
    if (episode) {
      await prisma.podcast.update({
        where: { id: episode.podcastId },
        data: { listenCount: { increment: 1 } }
      });
    }
    
    res.json({ success: true, progress });
  } catch (error) {
    console.error('Error updating episode progress:', error);
    res.status(500).json({ error: 'Failed to update episode progress' });
  }
};

// GET podcast categories
export const getPodcastCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { type: 'PODCAST' },
      orderBy: { name: 'asc' }
    });
    
    res.json(categories);
  } catch (error) {
    console.error('Error fetching podcast categories:', error);
    res.status(500).json({ error: 'Failed to fetch podcast categories' });
  }
};

// GET user's recently played episodes
export const getRecentlyPlayedEpisodes = async (req, res) => {
  try {
    const { userId } = req;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const recentProgress = await prisma.userEpisodeProgress.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      include: {
        episode: {
          include: {
            podcast: {
              include: {
                host: true
              }
            }
          }
        }
      }
    });
    
    const processedEpisodes = recentProgress.map(progress => ({
      ...progress.episode,
      podcast: {
        ...progress.episode.podcast,
        coverThumbnail: `${progress.episode.podcast.coverUrl}?w=200&h=200&fit=crop`
      },
      progress: {
        currentTime: progress.currentTime,
        duration: progress.duration,
        completed: progress.completed,
        percentage: progress.duration > 0 ? Math.round((progress.currentTime / progress.duration) * 100) : 0
      }
    }));
    
    res.json(processedEpisodes);
  } catch (error) {
    console.error('Error fetching recently played episodes:', error);
    res.status(500).json({ error: 'Failed to fetch recently played episodes' });
  }
};

// DELETE podcast
export const deletePodcast = async (req, res) => {
  try {
    const podcastId = parseInt(req.params.id);

    const deleted = await prisma.podcast.delete({
      where: { id: podcastId }
    });

    res.json({ message: 'Podcast deleted', deleted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete podcast' });
  }
};

// UPDATE podcast
export const updatePodcast = async (req, res) => {
  try {
    const podcastId = parseInt(req.params.id);
    const { title, hostId, coverUrl, description, categories } = req.body;

    const updateData = {
      ...(title && { title }),
      ...(hostId && { host: { connect: { id: parseInt(hostId) } } }),
      ...(coverUrl && { coverUrl }),
      ...(description && { description })
    };
    
    // Handle categories if provided
    if (categories && Array.isArray(categories)) {
      updateData.categories = {
        disconnect: {}, // Disconnect all existing categories
        connect: categories.map(catId => ({ id: parseInt(catId) }))
      };
    }

    const updated = await prisma.podcast.update({
      where: { id: podcastId },
      data: updateData,
      include: {
        host: true,
        categories: true
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating podcast:', error);
    res.status(500).json({ error: 'Failed to update podcast' });
  }
};

// CREATE podcast
export const createPodcast = async (req, res) => {
  try {
    const { title, hostId, coverUrl, description, categories, episodes = [] } = req.body;

    if (!title || !hostId) {
      return res.status(400).json({ error: 'Title and host are required' });
    }

    const createData = {
      title,
      host: { connect: { id: parseInt(hostId) } },
      coverUrl: coverUrl || 'https://via.placeholder.com/300x300?text=Podcast+Cover',
      description: description || '',
      listenCount: 0,
      viewCount: 0,
      episodes: {
        create: episodes.map(ep => ({
          title: ep.title,
          description: ep.description || '',
          audioUrl: ep.audioUrl,
          duration: ep.duration || 0,
          releaseDate: ep.releaseDate ? new Date(ep.releaseDate) : new Date()
        }))
      }
    };
    
    // Add categories if provided
    if (categories && Array.isArray(categories)) {
      createData.categories = {
        connect: categories.map(catId => ({ id: parseInt(catId) }))
      };
    }

    const newPodcast = await prisma.podcast.create({
      data: createData,
      include: { 
        host: true,
        categories: true,
        episodes: true
      }
    });

    res.status(201).json(newPodcast);
  } catch (error) {
    console.error('Error creating podcast:', error);
    res.status(500).json({ error: 'Failed to create podcast' });
  }
};
