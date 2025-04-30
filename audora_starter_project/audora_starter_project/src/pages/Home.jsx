import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import MainLayout from '../layout/MainLayout';
import AlbumCard from '../components/AlbumCard';
import api from '../services/api'; 

const Home = ({ setCurrentTrack }) => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/albums')
      .then(res => {
        setAlbums(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load albums.');
        setLoading(false);
      });
  }, []);

  return (
    <MainLayout>
      <h2 className="text-2xl font-semibold mb-4">Albums</h2>

      {loading && <p>Loading albums...</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {albums.map((album) => (
          <Link to={`/albums/${album.id}`} key={album.id}>
  <AlbumCard
    title={album.title}
    artist={album.artist}
    image={album.coverUrl}
    onClick={() =>
      setCurrentTrack({
        title: album.title,
        artist: album.artist,
        image: album.coverUrl,
        audioUrl: album.tracks?.[0]?.audioUrl || ''
      })
    }
  />
</Link>
        ))}
      </div>
    </MainLayout>
  );
};

export default Home;
