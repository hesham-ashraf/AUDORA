import express from 'express';
import { getHomeContent, recordInteraction, getTrending } from '../controllers/homeController.js';
import { authenticateOptional } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/home
 * @desc    Get personalized home page content
 * @access  Public (different content for authenticated users)
 */
router.get('/', authenticateOptional, getHomeContent);

/**
 * @route   GET /api/home/trending
 * @desc    Get trending content (non-personalized)
 * @access  Public
 */
router.get('/trending', getTrending);

/**
 * @route   POST /api/home/interaction
 * @desc    Record user interaction for improving recommendations
 * @access  Private
 */
router.post('/interaction', recordInteraction);

export default router; 