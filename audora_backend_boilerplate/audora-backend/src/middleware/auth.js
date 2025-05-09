import jwt from 'jsonwebtoken';
import prisma from '../services/prismaClient.js';

export const verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Authentication failed', 
        message: 'No valid authorization header found' 
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Authentication failed', 
        message: 'No token provided' 
      });
    }
    
    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < currentTime) {
        return res.status(401).json({ 
          error: 'Authentication failed', 
          message: 'Token expired' 
        });
      }
      
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });
      
      if (!user) {
        return res.status(401).json({ 
          error: 'Authentication failed', 
          message: 'User not found' 
        });
      }
      
      // Add user to request
      req.user = user;
      
      next();
    } catch (err) {
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          error: 'Authentication failed', 
          message: 'Invalid token' 
        });
      }
      
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Authentication failed', 
          message: 'Token expired' 
        });
      }
      
      throw err;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: 'Authentication process failed' 
    });
  }
};

// Alias for verifyToken to maintain compatibility with existing imports
export const authenticate = verifyToken;

export const authenticateOptional = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    // If no auth header or invalid format, continue as unauthenticated
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }
    
    const token = authHeader.split(' ')[1];
    
    // If no token, continue as unauthenticated
    if (!token) {
      req.user = null;
      return next();
    }
    
    // Try to verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < currentTime) {
        req.user = null;
        return next();
      }
      
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });
      
      // Add user to request (or null if not found)
      req.user = user || null;
      
      next();
    } catch (err) {
      // For any token errors, just continue as unauthenticated
      req.user = null;
      next();
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    // Even if there's an error, we want to continue as unauthenticated
    req.user = null;
    next();
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ 
      error: 'Authorization failed', 
      message: 'Requires admin privileges' 
    });
  }
  
  next();
}; 