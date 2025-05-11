import React, { useEffect, useState } from 'react';
import MainLayout from '../layout/MainLayout';
import { Play, Trash2 } from 'lucide-react';

const RecentlyPlayed = ({ setCurrentTrack }) => {
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('audora_recently_played') || '[]');
      setRecent(saved);
    } catch {
      setRecent([]);
    }
  }, []);

  const handlePlay = (track) => {
    if (setCurrentTrack) {
      setCurrentTrack(track);
    }
    // Move this track to the top of the list
    const updated = [track, ...recent.filter(t => t.id !== track.id)];
    setRecent(updated);
    localStorage.setItem('audora_recently_played', JSON.stringify(updated));
  };

  const handleClear = () => {
    setRecent([]);
    localStorage.removeItem('audora_recently_played');
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Recently Played</h2>
          {recent.length > 0 && (
            <button
              className="flex items-center gap-1 text-red-500 hover:text-red-700"
              onClick={handleClear}
              title="Clear History"
            >
              <Trash2 size={18} />
              Clear All
            </button>
          )}
        </div>
        {recent.length === 0 ? (
          <p className="text-gray-400">You haven't played any songs yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recent.map(track => (
              <div key={track.id} className="bg-white rounded-md p-4 shadow hover:shadow-md transition flex flex-col">
                <img src={track.image} alt={track.title} className="w-full h-40 object-cover rounded mb-2" />
                <h3 className="text-lg font-semibold">{track.title}</h3>
                <p className="text-sm text-gray-500">{track.artist}</p>
                <button
                  className="mt-2 flex items-center gap-1 bg-primary-600 text-white px-3 py-1 rounded hover:bg-primary-700"
                  onClick={() => handlePlay(track)}
                  title="Play Again"
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

export default RecentlyPlayed; 