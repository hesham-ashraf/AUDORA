import express from 'express';
import { register, login, getCurrentUser } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

// Get current user route (protected)
router.get('/me', verifyToken, getCurrentUser);

export default router; 