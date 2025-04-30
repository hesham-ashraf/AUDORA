import prisma from '../services/prismaClient.js';

// GET all playlists
export const getAllPlaylists = async (req, res) => {
  try {
    const playlists = await prisma.playlist.findMany({
      include: {
        tracks: true,
        user: true
      }
    });
    res.json(playlists);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
};

// GET single playlist by ID
export const getPlaylistById = async (req, res) => {
  try {
    const playlistId = parseInt(req.params.id);
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
      include: {
        tracks: true,
        user: true
      }
    });

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    res.json(playlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching playlist' });
  }
};


// delete playlist
export const deletePlaylist = async (req, res) => {
  try {
    const playlistId = parseInt(req.params.id);

    const deleted = await prisma.playlist.delete({
      where: { id: playlistId }
    });

    res.json({ message: 'Playlist deleted', deleted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete playlist' });
  }
};


// UPDATE Playlist
export const updatePlaylist = async (req, res) => {
  try {
    const playlistId = parseInt(req.params.id);
    const { title, trackIds } = req.body;

    const updated = await prisma.playlist.update({
      where: { id: playlistId },
      data: {
        ...(title && { title }),
        ...(trackIds && {
          tracks: {
            set: trackIds.map(id => ({ id }))
          }
        })
      },
      include: {
        tracks: true,
        user: true
      }
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update playlist' });
  }
};






// POST create playlist
export const createPlaylist = async (req, res) => {
  try {
    const { title, userId, trackIds } = req.body;

    const newPlaylist = await prisma.playlist.create({
      data: {
        title,
        user: {
          connect: { id: userId }
        },
        tracks: {
          connect: trackIds.map(id => ({ id }))
        }
      },
      include: {
        tracks: true,
        user: true
      }
    });

    res.status(201).json(newPlaylist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
};
