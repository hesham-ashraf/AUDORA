import express from 'express';
import {
  getAllPodcasts,
  getPodcastById,
  createPodcast,
  deletePodcast,
  updatePodcast
} from '../controllers/podcastController.js';

const router = express.Router();

router.get('/', getAllPodcasts);
router.get('/:id', getPodcastById);
router.post('/', createPodcast);
router.delete('/:id', deletePodcast);  
router.patch('/:id', updatePodcast);

export default router;
