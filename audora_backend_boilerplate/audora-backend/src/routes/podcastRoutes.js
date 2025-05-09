import express from 'express';
import {
  getAllPodcasts,
  getPodcastById,
  createPodcast,
  deletePodcast,
  updatePodcast
} from '../controllers/podcastController.js';
import { verifyToken, isAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllPodcasts);
router.get('/:id', getPodcastById);

// Admin protected routes
router.post('/', verifyToken, isAdmin, createPodcast);
router.delete('/:id', verifyToken, isAdmin, deletePodcast);
router.patch('/:id', verifyToken, isAdmin, updatePodcast);

export default router;
