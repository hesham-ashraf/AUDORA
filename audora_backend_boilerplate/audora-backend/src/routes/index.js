import express from 'express';
import prisma from '../services/prismaClient.js';
import albumRoutes from './albumRoutes.js';
import podcastRoutes from './podcastRoutes.js';
import playlistRoutes from './playlistRoutes.js';
import trackRoutes from './trackRoutes.js';
import episodeRoutes from './episodeRoutes.js';
import userRoutes from './userRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import authRoutes from './authRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import homeRoutes from './homeRoutes.js';
import searchRoutes from './searchRoutes.js';

const router = express.Router();

// Add your feature routes here
router.use('/albums', albumRoutes);
router.use('/podcasts', podcastRoutes);
router.use('/playlists', playlistRoutes);
router.use('/tracks', trackRoutes);
router.use('/episodes', episodeRoutes);
router.use('/users', userRoutes);
router.use('/upload', uploadRoutes);
router.use('/auth', authRoutes);
router.use('/reviews', reviewRoutes);
router.use('/home', homeRoutes);
router.use('/search', searchRoutes);

// Add route for live streams
router.get('/live-streams', (req, res) => {
  // Mock data for live streams
  const liveStreams = [
    {
      id: 1,
      title: 'Late Night Jazz',
      host: 'JazzMaster',
      coverUrl: 'https://images.unsplash.com/photo-1516223725307-6f76b9ec8742?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      streamUrl: 'https://res.cloudinary.com/dnbk3iouw/video/upload/v1746054444/Billie_Eilish_-_WILDFLOWER_Official_Lyric_Video_evhsdd.mp3',
      listeners: 1245,
      isLive: true
    },
    {
      id: 2,
      title: 'Morning Classical',
      host: 'ClassicalFM',
      coverUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      streamUrl: 'https://res.cloudinary.com/dnbk3iouw/video/upload/v1746054425/after_hours_ded5tr.mp3',
      listeners: 842,
      isLive: true
    },
    {
      id: 3,
      title: 'Indie Spotlight',
      host: 'IndieVibes',
      coverUrl: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      streamUrl: 'https://res.cloudinary.com/dnbk3iouw/video/upload/v1746054389/Stay_ybim8r.mp3',
      listeners: 623,
      isLive: true
    }
  ];
  
  res.json(liveStreams);
});

router.get('/', (req, res) => {
  res.send('Welcome to AUDORA Backend API 🚀');
});

// Test route: Get all users
router.get('/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

export default router;