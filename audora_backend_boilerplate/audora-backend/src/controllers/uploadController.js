import cloudinaryService from '../services/cloudinaryService.js';
import prisma from '../services/prismaClient.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Upload audio file to Cloudinary and save track to database
export const uploadAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { albumId, title, duration } = req.body;
    
    if (!albumId || !title) {
      return res.status(400).json({ error: 'Album ID and title are required' });
    }

    // Upload file to Cloudinary
    const result = await cloudinaryService.uploadFile(req.file.path, {
      resource_type: 'video',
      folder: 'audora/tracks'
    });

    // Create track in database
    const track = await prisma.track.create({
      data: {
        title,
        duration: parseInt(duration || 0),
        audioUrl: result.secure_url,
        album: {
          connect: { id: parseInt(albumId) }
        }
      },
      include: {
        album: true
      }
    });

    // Remove temporary file
    fs.unlinkSync(req.file.path);

    res.status(201).json(track);
  } catch (error) {
    console.error('Error uploading audio:', error);
    
    // Remove temporary file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Error removing temp file:', err);
      }
    }
    
    res.status(500).json({ error: 'Failed to upload audio file' });
  }
};

// Upload image file to Cloudinary
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { type } = req.body;
    
    if (!type) {
      return res.status(400).json({ error: 'Image type is required (album, podcast, user)' });
    }

    // Upload file to Cloudinary
    const result = await cloudinaryService.uploadFile(req.file.path, {
      resource_type: 'image',
      folder: `audora/images/${type}`
    });

    // Remove temporary file
    fs.unlinkSync(req.file.path);

    res.status(201).json({
      imageUrl: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    
    // Remove temporary file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Error removing temp file:', err);
      }
    }
    
    res.status(500).json({ error: 'Failed to upload image file' });
  }
};

// Get signed URL for audio file
export const getSignedUrl = async (req, res) => {
  try {
    const { trackId } = req.params;
    
    // Get track from database
    const track = await prisma.track.findUnique({
      where: { id: parseInt(trackId) }
    });
    
    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }
    
    // Extract public ID from URL
    const publicId = track.audioUrl
      .split('/')
      .slice(-2)
      .join('/')
      .split('.')[0];
    
    // Generate signed URL
    const signedUrl = cloudinaryService.generateSignedUrl(publicId, {
      expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour
    });
    
    res.json({ signedUrl });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    res.status(500).json({ error: 'Failed to generate signed URL' });
  }
}; 