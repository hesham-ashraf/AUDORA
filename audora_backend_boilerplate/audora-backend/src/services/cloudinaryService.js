import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dnbk3iouw',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Get info about a file stored in Cloudinary
 * @param {string} publicId - The public ID of the file
 * @returns {Promise<object>} - Info about the file
 */
export const getFileInfo = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    return result;
  } catch (error) {
    console.error('Error getting file info from Cloudinary:', error);
    throw error;
  }
};

/**
 * Upload a file to Cloudinary
 * @param {string} filePath - Path to the file to upload
 * @param {object} options - Upload options
 * @returns {Promise<object>} - Upload result
 */
export const uploadFile = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'auto',
      ...options
    });
    return result;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

/**
 * Generate a signed URL for a file
 * @param {string} publicId - The public ID of the file
 * @param {object} options - Options for the signed URL
 * @returns {string} - Signed URL
 */
export const generateSignedUrl = (publicId, options = {}) => {
  const defaultOptions = {
    resource_type: 'video',
    format: 'mp3'
  };
  
  return cloudinary.url(publicId, {
    ...defaultOptions,
    ...options,
    signed: true
  });
};

export default {
  getFileInfo,
  uploadFile,
  generateSignedUrl
}; 