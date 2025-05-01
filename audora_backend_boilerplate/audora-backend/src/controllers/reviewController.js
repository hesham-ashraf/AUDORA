import prisma from '../services/prismaClient.js';

// Create a new review
export const createReview = async (req, res) => {
  try {
    const { contentType, contentId, rating, comment } = req.body;
    const userId = req.user.id;
    
    // Validate input
    if (!contentType || !contentId || !rating) {
      return res.status(400).json({ error: 'Content type, content ID, and rating are required' });
    }
    
    // Check if content exists
    let content;
    if (contentType === 'album') {
      content = await prisma.album.findUnique({
        where: { id: parseInt(contentId) }
      });
    } else if (contentType === 'podcast') {
      content = await prisma.podcast.findUnique({
        where: { id: parseInt(contentId) }
      });
    } else {
      return res.status(400).json({ error: 'Invalid content type' });
    }
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    // Check if user already reviewed this content
    const existingReview = await prisma.review.findFirst({
      where: {
        contentType,
        contentId: parseInt(contentId),
        userId
      }
    });
    
    if (existingReview) {
      // Update existing review
      const updatedReview = await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating: parseInt(rating),
          comment: comment || null
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
      
      return res.json(updatedReview);
    }
    
    // Create new review
    const reviewData = {
      contentType,
      contentId: parseInt(contentId),
      rating: parseInt(rating),
      comment: comment || null,
      userId
    };
    
    // Add relation based on content type
    if (contentType === 'album') {
      reviewData.albumId = parseInt(contentId);
    } else if (contentType === 'podcast') {
      reviewData.podcastId = parseInt(contentId);
    }
    
    const review = await prisma.review.create({
      data: reviewData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
};

// Get reviews for content
export const getReviewsForContent = async (req, res) => {
  try {
    const { contentType, contentId } = req.params;
    
    // Validate input
    if (!contentType || !contentId) {
      return res.status(400).json({ error: 'Content type and content ID are required' });
    }
    
    // Get reviews
    const reviews = await prisma.review.findMany({
      where: {
        contentType,
        contentId: parseInt(contentId)
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json(reviews);
  } catch (error) {
    console.error('Error getting reviews:', error);
    res.status(500).json({ error: 'Failed to get reviews' });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Find review
    const review = await prisma.review.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    // Check if user owns review or is admin
    if (review.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    // Delete review
    await prisma.review.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ message: 'Review deleted' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
}; 