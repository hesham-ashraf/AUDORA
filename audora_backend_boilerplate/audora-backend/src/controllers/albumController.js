import prisma from '../services/prismaClient.js';

// GET all albums
export const getAllAlbums = async (req, res) => {
  try {
    const albums = await prisma.album.findMany({
      include: { tracks: true }
    });
    res.json(albums);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch albums' });
  }
};

// GET album by ID
export const getAlbumById = async (req, res) => {
  try {
    const albumId = parseInt(req.params.id);
    const album = await prisma.album.findUnique({
      where: { id: albumId },
      include: { tracks: true }
    });

    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }

    res.json(album);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching album' });
  }
};


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




export const updateAlbum = async (req, res) => {
  try {
    const albumId = parseInt(req.params.id);
    const { title, artist, coverUrl } = req.body;

    const updated = await prisma.album.update({
      where: { id: albumId },
      data: {
        ...(title && { title }),
        ...(artist && { artist }),
        ...(coverUrl && { coverUrl })
      }
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update album' });
  }
};





// POST create new album
export const createAlbum = async (req, res) => {
  try {
    const { title, artist, coverUrl, tracks } = req.body;

    const newAlbum = await prisma.album.create({
      data: {
        title,
        artist,
        coverUrl,
        tracks: {
          create: tracks.map(track => ({
            title: track.title,
            duration: track.duration,
            audioUrl: track.audioUrl
          }))
        }
      },
      include: { tracks: true }
    });

    res.status(201).json(newAlbum);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create album' });
  }
};
