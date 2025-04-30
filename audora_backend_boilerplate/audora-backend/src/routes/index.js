import express from 'express';
import prisma from '../services/prismaClient.js';
import albumRoutes from './albumRoutes.js';
import podcastRoutes from './podcastRoutes.js';
import playlistRoutes from './playlistRoutes.js';
import trackRoutes from './trackRoutes.js';
import episodeRoutes from './episodeRoutes.js';
import userRoutes from './userRoutes.js';


const router = express.Router();

// Add your feature routes here

router.use('/albums', albumRoutes);
router.use('/podcasts', podcastRoutes);
router.use('/playlists', playlistRoutes);
router.use('/tracks', trackRoutes);
router.use('/episodes', episodeRoutes);
router.use('/users', userRoutes);


router.get('/', (req, res) => {
  res.send('Welcome to AUDORA Backend API 🚀');
  
});
// Test route: Get all users
router.get('/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

export default router;