import express from 'express';
import {
  getAllAlbums,
  getAlbumById,
  createAlbum,
  deleteAlbum,
  updateAlbum
} from '../controllers/albumController.js';

const router = express.Router();

router.get('/', getAllAlbums);
router.get('/:id', getAlbumById);
router.post('/', createAlbum);
router.delete('/:id', deleteAlbum);  
router.patch('/:id', updateAlbum);

export default router;
