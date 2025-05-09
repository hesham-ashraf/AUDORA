import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { uploadAudio, getSignedUrl, uploadImage } from '../controllers/uploadController.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check request path to determine file type
  if (req.path === '/audio' && file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else if (req.path === '/image' && file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error(`Only ${req.path === '/audio' ? 'audio' : 'image'} files are allowed`), false);
  }
};

// Initialize multer upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 30 * 1024 * 1024, // 30MB max file size
  }
});

// Protected routes
router.post('/audio', verifyToken, upload.single('audio'), uploadAudio);
router.post('/image', verifyToken, upload.single('image'), uploadImage);

// Route for getting signed URL for audio files
router.get('/audio/:trackId/signed-url', getSignedUrl);

export default router; 