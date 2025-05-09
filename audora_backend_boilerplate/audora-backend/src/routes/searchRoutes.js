import express from 'express';
import { 
  searchContent, 
  getAutocompleteSuggestions, 
  getSearchHistory, 
  saveSearchHistory,
  clearSearchHistory
} from '../controllers/searchController.js';
import { searchRateLimiter } from '../middleware/rateLimiter.js';
import { authenticate, authenticateOptional } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/search
 * @desc    Search for content (albums, tracks, artists, podcasts)
 * @access  Public
 */
router.get('/', searchRateLimiter.standard, authenticateOptional, searchContent);

/**
 * @route   GET /api/search/autocomplete
 * @desc    Get autocomplete suggestions for search queries
 * @access  Public
 */
router.get('/autocomplete', searchRateLimiter.autocomplete, getAutocompleteSuggestions);

/**
 * @route   GET /api/search/history
 * @desc    Get search history for authenticated user
 * @access  Private
 */
router.get('/history', authenticate, searchRateLimiter.history, getSearchHistory);

/**
 * @route   POST /api/search/history
 * @desc    Save search query to history
 * @access  Private
 */
router.post('/history', authenticate, searchRateLimiter.history, saveSearchHistory);

/**
 * @route   DELETE /api/search/history
 * @desc    Clear search history
 * @access  Private
 */
router.delete('/history', authenticate, searchRateLimiter.history, clearSearchHistory);

export default router; 