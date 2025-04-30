import express from 'express';
import {
  getAllEpisodes,
  getEpisodeById
} from '../controllers/episodeController.js';

const router = express.Router();

router.get('/', getAllEpisodes);
router.get('/:id', getEpisodeById);

export default router;
