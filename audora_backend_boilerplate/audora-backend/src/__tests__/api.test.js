import request from 'supertest';
import express from 'express';
import playlistRoutes from '../routes/playlistRoutes.js';
import albumRoutes from '../routes/albumRoutes.js';

// Mock dependencies
jest.mock('../services/prismaClient.js', () => ({
  playlist: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    update: jest.fn()
  },
  album: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    update: jest.fn()
  }
}));

jest.mock('../middlewares/auth.js', () => ({
  verifyToken: jest.fn((req, res, next) => {
    // If test provides auth token, add user to request
    if (req.headers.authorization === 'Bearer valid-token') {
      req.user = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'USER'
      };
      return next();
    }
    
    if (req.headers.authorization === 'Bearer admin-token') {
      req.user = {
        id: 2,
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'ADMIN'
      };
      return next();
    }
    
    return res.status(401).json({ error: 'Authentication failed' });
  }),
  isAdmin: jest.fn((req, res, next) => {
    if (req.user?.role === 'ADMIN') {
      return next();
    }
    return res.status(403).json({ error: 'Authorization failed' });
  })
}));

// Setup express app for testing
const app = express();
app.use(express.json());
app.use('/api/playlists', playlistRoutes);
app.use('/api/albums', albumRoutes);

describe('API Endpoints', () => {
  let prisma;
  
  beforeEach(() => {
    prisma = require('../services/prismaClient.js');
    jest.clearAllMocks();
  });
  
  describe('Playlist Endpoints', () => {
    it('should get all playlists', async () => {
      // Mock implementation
      prisma.playlist.findMany.mockResolvedValue([
        { id: 1, title: 'Playlist 1', userId: 1 },
        { id: 2, title: 'Playlist 2', userId: 2 }
      ]);
      
      const response = await request(app).get('/api/playlists');
      
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });
    
    it('should get single playlist by id', async () => {
      // Mock implementation
      prisma.playlist.findUnique.mockResolvedValue({
        id: 1,
        title: 'Playlist 1',
        userId: 1,
        tracks: []
      });
      
      const response = await request(app).get('/api/playlists/1');
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('title', 'Playlist 1');
    });
    
    it('should create playlist with valid token', async () => {
      // Mock implementation
      prisma.playlist.create.mockResolvedValue({
        id: 3,
        title: 'New Playlist',
        userId: 1
      });
      
      const response = await request(app)
        .post('/api/playlists')
        .set('Authorization', 'Bearer valid-token')
        .send({ title: 'New Playlist' });
      
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('id', 3);
      expect(response.body).toHaveProperty('title', 'New Playlist');
    });
    
    it('should deny playlist creation without token', async () => {
      const response = await request(app)
        .post('/api/playlists')
        .send({ title: 'New Playlist' });
      
      expect(response.statusCode).toBe(401);
    });
  });
  
  describe('Album Endpoints', () => {
    it('should get all albums', async () => {
      // Mock implementation
      prisma.album.findMany.mockResolvedValue([
        { id: 1, title: 'Album 1', artist: 'Artist 1', coverUrl: 'url1' },
        { id: 2, title: 'Album 2', artist: 'Artist 2', coverUrl: 'url2' }
      ]);
      
      const response = await request(app).get('/api/albums');
      
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });
    
    it('should get single album by id', async () => {
      // Mock implementation
      prisma.album.findUnique.mockResolvedValue({
        id: 1,
        title: 'Album 1',
        artist: 'Artist 1',
        coverUrl: 'url1',
        tracks: []
      });
      
      const response = await request(app).get('/api/albums/1');
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('title', 'Album 1');
    });
    
    it('should create album with admin token', async () => {
      // Mock implementation
      prisma.album.create.mockResolvedValue({
        id: 3,
        title: 'New Album',
        artist: 'New Artist',
        coverUrl: 'newurl'
      });
      
      const response = await request(app)
        .post('/api/albums')
        .set('Authorization', 'Bearer admin-token')
        .send({
          title: 'New Album',
          artist: 'New Artist',
          coverUrl: 'newurl'
        });
      
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('id', 3);
      expect(response.body).toHaveProperty('title', 'New Album');
    });
    
    it('should deny album creation with regular user token', async () => {
      const response = await request(app)
        .post('/api/albums')
        .set('Authorization', 'Bearer valid-token')
        .send({
          title: 'New Album',
          artist: 'New Artist',
          coverUrl: 'newurl'
        });
      
      expect(response.statusCode).toBe(403);
    });
    
    it('should deny album creation without token', async () => {
      const response = await request(app)
        .post('/api/albums')
        .send({
          title: 'New Album',
          artist: 'New Artist',
          coverUrl: 'newurl'
        });
      
      expect(response.statusCode).toBe(401);
    });
  });
}); 