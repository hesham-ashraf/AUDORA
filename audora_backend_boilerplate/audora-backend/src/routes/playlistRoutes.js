import express from 'express';
import {
  getAllPlaylists,
  getPlaylistById,
  createPlaylist,
  deletePlaylist,
  updatePlaylist
} from '../controllers/playlistController.js';

const router = express.Router();

router.get('/', getAllPlaylists);
router.get('/:id', getPlaylistById);
router.post('/', createPlaylist);
router.delete('/:id', deletePlaylist);  
router.patch('/:id', updatePlaylist);

export default router;
