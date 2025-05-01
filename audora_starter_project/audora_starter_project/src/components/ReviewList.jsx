import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ReviewList = ({ contentId, contentType }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await api.get(`/reviews/${contentType}/${contentId}`);
        setReviews(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load reviews');
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, [contentId, contentType]);
  
  if (loading) return <div className="p-4">Loading reviews...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (reviews.length === 0) return <div className="p-4">No reviews yet</div>;
  
  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
  
  return (
    <div className="mb-6">
      <div className="flex items-center mb-4">
        <h3 className="text-xl font-semibold">Reviews</h3>
        <div className="ml-4 flex items-center">
          <span className="text-lg mr-1">{averageRating.toFixed(1)}</span>
          <span className="text-yellow-500">★</span>
          <span className="ml-2 text-sm text-gray-500">({reviews.length} reviews)</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white p-4 rounded-md shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <div className="font-medium">{review.user?.name || 'Anonymous'}</div>
                <div className="ml-3 text-yellow-500">
                  {'★'.repeat(review.rating)}
                  {'☆'.repeat(5 - review.rating)}
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {new Date(review.createdAt).toLocaleDateString()}
              </div>
            </div>
            
            {review.comment && (
              <p className="text-gray-700">{review.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList; 