import express from 'express';
import {
  getAllTracks,
  getTrackById
} from '../controllers/trackController.js';

const router = express.Router();

router.get('/', getAllTracks);
router.get('/:id', getTrackById);

export default router;
