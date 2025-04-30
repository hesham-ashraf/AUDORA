import prisma from '../services/prismaClient.js';

// GET all tracks
export const getAllTracks = async (req, res) => {
  try {
    const tracks = await prisma.track.findMany({
      include: {
        album: true
      }
    });
    res.json(tracks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch tracks' });
  }
};

// GET track by ID
export const getTrackById = async (req, res) => {
  try {
    const trackId = parseInt(req.params.id);
    const track = await prisma.track.findUnique({
      where: { id: trackId },
      include: {
        album: true
      }
    });

    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    res.json(track);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch track' });
  }
};
