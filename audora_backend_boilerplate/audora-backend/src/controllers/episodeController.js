import prisma from '../services/prismaClient.js';

// GET all episodes
export const getAllEpisodes = async (req, res) => {
  try {
    const episodes = await prisma.episode.findMany({
      include: {
        podcast: true
      }
    });
    res.json(episodes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch episodes' });
  }
};

// GET episode by ID
export const getEpisodeById = async (req, res) => {
  try {
    const episodeId = parseInt(req.params.id);
    const episode = await prisma.episode.findUnique({
      where: { id: episodeId },
      include: {
        podcast: true
      }
    });

    if (!episode) {
      return res.status(404).json({ error: 'Episode not found' });
    }

    res.json(episode);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch episode' });
  }
};
