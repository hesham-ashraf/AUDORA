import express from 'express';
import {
  getAllAlbums,
  getAlbumById,
  createAlbum,
  deleteAlbum,
  updateAlbum,
  getTrendingAlbums,
  getAlbumsByGenre,
  getRelatedAlbums,
  getAllGenres,
  recordAlbumPlay
} from '../controllers/albumController.js';
import { authenticate, authenticateOptional } from '../middleware/auth.js';
import { apiRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes with rate limiting
router.get('/', apiRateLimiter, getAllAlbums);
router.get('/trending', apiRateLimiter, getTrendingAlbums);
router.get('/genres', apiRateLimiter, getAllGenres);
router.get('/genre/:genre', apiRateLimiter, getAlbumsByGenre);
router.get('/:id', apiRateLimiter, authenticateOptional, getAlbumById);
router.get('/:id/related', apiRateLimiter, getRelatedAlbums);
router.post('/:id/play', apiRateLimiter, recordAlbumPlay);

// Protected routes requiring authentication
router.post('/', authenticate, createAlbum);
router.delete('/:id', authenticate, deleteAlbum);
router.patch('/:id', authenticate, updateAlbum);

export default router;
