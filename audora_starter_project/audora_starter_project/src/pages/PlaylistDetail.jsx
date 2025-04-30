import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const PlaylistDetail = ({ setCurrentTrack }) => {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`http://localhost:5000/api/playlists/${id}`)
      .then(res => setPlaylist(res.data))
      .catch(() => setError('Failed to load playlist'));
  }, [id]);

  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!playlist) return <div className="p-6">Loading playlist...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{playlist.title}</h1>
        <p className="text-lg text-gray-500">Created by {playlist.user?.name || 'Unknown'}</p>
      </div>

      <h2 className="text-xl font-semibold mb-4">Tracks</h2>
      <ul className="space-y-3">
        {playlist.tracks.map(track => (
          <li
            key={track.id}
            className="p-3 rounded-md bg-gray-100 hover:bg-gray-200 cursor-pointer"
            onClick={() => setCurrentTrack({
              title: track.title,
              artist: playlist.user?.name || 'Playlist',
              image: playlist.coverUrl,
              audioUrl: track.audioUrl
            })}
          >
            🎵 {track.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlaylistDetail;