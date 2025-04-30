import prisma from '../services/prismaClient.js';

// GET all podcasts
export const getAllPodcasts = async (req, res) => {
  try {
    const podcasts = await prisma.podcast.findMany({
      include: { episodes: true }
    });
    res.json(podcasts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch podcasts' });
  }
};

// GET single podcast by ID
export const getPodcastById = async (req, res) => {
  try {
    const podcastId = parseInt(req.params.id);
    const podcast = await prisma.podcast.findUnique({
      where: { id: podcastId },
      include: { episodes: true }
    });

    if (!podcast) {
      return res.status(404).json({ error: 'Podcast not found' });
    }

    res.json(podcast);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching podcast' });
  }
};


// delete podcast 
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

// update podcast 
export const updatePodcast = async (req, res) => {
  try {
    const podcastId = parseInt(req.params.id);
    const { title, host, coverUrl } = req.body;

    const updated = await prisma.podcast.update({
      where: { id: podcastId },
      data: {
        ...(title && { title }),
        ...(host && { host }),
        ...(coverUrl && { coverUrl })
      }
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update podcast' });
  }
};




// POST create new podcast
export const createPodcast = async (req, res) => {
  try {
    const { title, host, coverUrl, episodes } = req.body;

    const newPodcast = await prisma.podcast.create({
      data: {
        title,
        host,
        coverUrl,
        episodes: {
          create: episodes.map(ep => ({
            title: ep.title,
            duration: ep.duration,
            audioUrl: ep.audioUrl
          }))
        }
      },
      include: { episodes: true }
    });

    res.status(201).json(newPodcast);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create podcast' });
  }
};
