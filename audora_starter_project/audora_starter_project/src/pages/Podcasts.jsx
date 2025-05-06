import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import axios from 'axios';
import { podcasts as podcastsData } from '../utils/mockData';

const Podcasts = () => {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading from API
    const timer = setTimeout(() => {
      setPodcasts(podcastsData);
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <MainLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Podcasts</h2>
        <p className="text-gray-600">Discover interesting podcasts from various categories</p>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading podcasts...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {podcasts.map(podcast => (
            <Link
              to={`/podcasts/${podcast.id}`}
              key={podcast.id}
              className="bg-dark-200 rounded-lg overflow-hidden shadow hover:shadow-md transition group border border-white/10"
            >
              <div className="aspect-square overflow-hidden">
                <img 
                  src={podcast.coverUrl} 
                  alt={podcast.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white">{podcast.title}</h3>
                <p className="text-sm text-gray-400">Host: {podcast.host}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {podcast.episodes?.length || 0} episode{podcast.episodes?.length !== 1 ? 's' : ''}
                </p>
                <div className="mt-3 flex gap-2 flex-wrap">
                  {getRandomCategories().map(category => (
                    <span key={category} className="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs text-gray-700">
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </MainLayout>
  );
};

// Helper function to generate random categories for each podcast
function getRandomCategories() {
  const categories = [
    'Technology', 'Health', 'Business', 'Science', 'True Crime', 
    'Comedy', 'News', 'Education', 'Finance', 'Travel', 'Music',
    'Self-Improvement', 'History', 'Politics', 'Entertainment'
  ];
  
  const shuffled = [...categories].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.floor(Math.random() * 3) + 1); // Return 1-3 random categories
}

export default Podcasts;