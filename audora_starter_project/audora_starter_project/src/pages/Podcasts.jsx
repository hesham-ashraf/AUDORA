import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import axios from 'axios';

const Podcasts = () => {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/podcasts')
      .then(res => {
        setPodcasts(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <MainLayout>
      <h2 className="text-2xl font-semibold mb-6">Podcasts</h2>
      {loading && <p>Loading podcasts...</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {podcasts.map(podcast => (
          <Link
            to={`/podcasts/${podcast.id}`}
            key={podcast.id}
            className="bg-white rounded-md p-4 shadow hover:shadow-md transition"
          >
            <img src={podcast.coverUrl} alt={podcast.title} className="rounded-md w-full h-40 object-cover mb-3" />
            <h3 className="text-lg font-semibold">{podcast.title}</h3>
            <p className="text-sm text-gray-500">Host: {podcast.host}</p>
          </Link>
        ))}
      </div>
    </MainLayout>
  );
};

export default Podcasts;