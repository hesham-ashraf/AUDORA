import React, { useState } from 'react';
import { Play } from 'lucide-react';

const AlbumCard = ({ title, artist, image, onClick }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const handleClick = (e) => {
    e.preventDefault(); // Prevent navigation if inside a Link
    if (onClick) onClick();
  };
  
  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };
  
  const handleImageLoad = () => {
    setImageLoaded(true);
  };
  
  // Fallback image if original fails to load
  const fallbackImage = 'https://via.placeholder.com/300x300?text=Album';
  
  // Use thumbnail version of image if available (image URL might already be the thumbnail)
  const optimizedImage = image;

  return (
    <div className="relative group rounded-lg overflow-hidden transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl">
      <div className="aspect-square relative overflow-hidden rounded-lg bg-dark-100">
        {/* Show a loading placeholder until image loads */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark-100 animate-pulse">
            <div className="w-12 h-12 rounded-full border-2 border-primary-600 border-t-transparent animate-spin"></div>
          </div>
        )}
        
        <img
          src={imageError ? fallbackImage : optimizedImage}
          alt={`${title} by ${artist}`}
          className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
        
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={handleClick}
            className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-lg transform transition-transform hover:scale-110"
            aria-label={`Play ${title}`}
          >
            <Play size={20} className="ml-1" />
          </button>
        </div>
      </div>
      <div className="mt-2">
        <h3 className="font-medium text-white truncate">{title}</h3>
        <p className="text-sm text-gray-400 truncate">{artist}</p>
      </div>
    </div>
  );
};

export default AlbumCard;
