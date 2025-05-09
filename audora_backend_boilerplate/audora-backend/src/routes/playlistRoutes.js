import express from 'express';
import {
  getAllPlaylists,
  getPlaylistById,
  createPlaylist,
  deletePlaylist,
  updatePlaylist
} from '../controllers/playlistController.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllPlaylists);
router.get('/:id', getPlaylistById);

// Protected routes - require authentication
router.post('/', verifyToken, createPlaylist);
router.delete('/:id', verifyToken, deletePlaylist);  
router.patch('/:id', verifyToken, updatePlaylist);

export default router;
