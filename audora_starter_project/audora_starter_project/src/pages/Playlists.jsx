import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import axios from 'axios';

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/playlists')
      .then(res => {
        setPlaylists(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <MainLayout>
      <h2 className="text-2xl font-semibold mb-6">Playlists</h2>
      {loading && <p>Loading playlists...</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {playlists.map(playlist => (
          <Link
            to={`/playlists/${playlist.id}`}
            key={playlist.id}
            className="bg-white rounded-md p-4 shadow hover:shadow-md transition"
          >
            <h3 className="text-lg font-semibold">{playlist.title}</h3>
            <p className="text-sm text-gray-500">By {playlist.user?.name || 'Unknown'}</p>
            <p className="text-sm text-gray-400 mt-1">{playlist.tracks.length} tracks</p>
          </Link>
        ))}
      </div>
    </MainLayout>
  );
};

export default Playlists;