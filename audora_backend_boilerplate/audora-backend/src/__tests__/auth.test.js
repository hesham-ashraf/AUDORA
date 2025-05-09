import request from 'supertest';
import jwt from 'jsonwebtoken';
import express from 'express';
import authRoutes from '../routes/authRoutes.js';
import { verifyToken } from '../middlewares/auth.js';

// Mock dependencies
jest.mock('../services/prismaClient.js', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn()
  }
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(() => 'hashedPassword'),
  genSalt: jest.fn(() => 'salt'),
  compare: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'token'),
  verify: jest.fn()
}));

// Setup express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// Create a simple protected route for testing auth middleware
app.get('/api/protected', verifyToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

describe('Authentication', () => {
  let prisma;
  
  beforeEach(() => {
    prisma = require('../services/prismaClient.js');
    jest.clearAllMocks();
  });
  
  describe('Register Endpoint', () => {
    it('should register a new user', async () => {
      // Mock implementations
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'USER'
      });
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });
      
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('name', 'Test User');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
      expect(response.body.user).not.toHaveProperty('password');
    });
    
    it('should return 400 if user already exists', async () => {
      // Mock existing user
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'test@example.com'
      });
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });
      
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
  
  describe('Login Endpoint', () => {
    it('should login a user and return token', async () => {
      // Mock implementations
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword'
      });
      
      const bcrypt = require('bcryptjs');
      bcrypt.compare.mockResolvedValue(true);
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });
    
    it('should return 401 for invalid credentials', async () => {
      // Mock implementations
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword'
      });
      
      const bcrypt = require('bcryptjs');
      bcrypt.compare.mockResolvedValue(false);
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });
      
      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });
  
  describe('Authentication Middleware', () => {
    it('should allow access with valid token', async () => {
      // Mock implementation
      jwt.verify.mockImplementation(() => ({ userId: 1 }));
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        name: 'Test User',
        email: 'test@example.com'
      });
      
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Bearer valid-token');
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
    
    it('should deny access with invalid token', async () => {
      // Mock implementation
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Bearer invalid-token');
      
      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
    
    it('should deny access with no token', async () => {
      const response = await request(app)
        .get('/api/protected');
      
      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 