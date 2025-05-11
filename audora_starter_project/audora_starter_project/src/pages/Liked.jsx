import React, { useEffect, useState } from 'react';
import MainLayout from '../layout/MainLayout';
import { Heart, Play } from 'lucide-react';

const Liked = ({ setCurrentTrack }) => {
  const [liked, setLiked] = useState([]);

  useEffect(() => {
    // Try to load liked items from localStorage (or use mock data)
    try {
      const saved = JSON.parse(localStorage.getItem('audora_favorites') || '[]');
      setLiked(saved);
    } catch {
      setLiked([]);
    }
  }, []);

  const handleUnlike = (id) => {
    const updated = liked.filter(item => item.id !== id);
    setLiked(updated);
    localStorage.setItem('audora_favorites', JSON.stringify(updated));
  };

  const handlePlay = (item) => {
    if (setCurrentTrack) {
      setCurrentTrack(item);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold text-white mb-6">Liked Songs</h2>
        {liked.length === 0 ? (
          <p className="text-gray-400">You haven't liked any songs yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {liked.map(item => (
              <div key={item.id} className="bg-white rounded-md p-4 shadow hover:shadow-md transition relative flex flex-col">
                <button
                  className="absolute top-2 right-2 text-red-500 hover:text-gray-400"
                  onClick={() => handleUnlike(item.id)}
                  title="Unlike"
                >
                  <Heart size={24} fill="currentColor" />
                </button>
                <img src={item.image} alt={item.title} className="w-full h-40 object-cover rounded mb-2" />
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.artist}</p>
                <button
                  className="mt-2 flex items-center gap-1 bg-primary-600 text-white px-3 py-1 rounded hover:bg-primary-700 self-start"
                  onClick={() => handlePlay(item)}
                  title="Play"
                >
                  <Play size={18} />
                  Play
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Liked; 