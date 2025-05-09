import express from 'express';
import {
  getAllAlbums,
  getAlbumById,
  createAlbum,
  deleteAlbum,
  updateAlbum
} from '../controllers/albumController.js';
import { verifyToken, isAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllAlbums);
router.get('/:id', getAlbumById);

// Admin protected routes
router.post('/', verifyToken, isAdmin, createAlbum);
router.delete('/:id', verifyToken, isAdmin, deleteAlbum);
router.patch('/:id', verifyToken, isAdmin, updateAlbum);

export default router;
