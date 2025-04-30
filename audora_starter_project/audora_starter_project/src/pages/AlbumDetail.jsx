import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const AlbumDetail = ({ setCurrentTrack }) => {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/albums/${id}`)
      .then(res => setAlbum(res.data))
      .catch(() => setError('Failed to load album'));
  }, [id]);

  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!album) return <div className="p-6">Loading album...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-6 mb-6">
        <img src={album.coverUrl} alt={album.title} className="w-40 h-40 rounded-lg object-cover" />
        <div>
          <h1 className="text-3xl font-bold">{album.title}</h1>
          <p className="text-lg text-gray-500">By {album.artist}</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Tracks</h2>
      <ul className="space-y-3">
        {album.tracks.map(track => (
          <li
            key={track.id}
            className="p-3 rounded-md bg-gray-100 hover:bg-gray-200 cursor-pointer"
            onClick={() => setCurrentTrack({
              title: track.title,
              artist: album.artist,
              image: album.coverUrl,
              audioUrl: track.audioUrl
            })}
          >
            🎵 {track.title} — <span className="text-sm text-gray-500">{Math.floor(track.duration / 60)}:{('0' + track.duration % 60).slice(-2)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AlbumDetail;
