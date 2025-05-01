import express from 'express';
import {
  createReview,
  getReviewsForContent,
  deleteReview
} from '../controllers/reviewController.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

// Get reviews for content
router.get('/:contentType/:contentId', getReviewsForContent);

// Create a review (protected)
router.post('/', verifyToken, createReview);

// Delete a review (protected)
router.delete('/:id', verifyToken, deleteReview);

export default router; 