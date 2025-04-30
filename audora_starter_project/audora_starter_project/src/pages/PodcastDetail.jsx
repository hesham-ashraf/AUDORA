import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const PodcastDetail = ({ setCurrentTrack }) => {
  const { id } = useParams();
  const [podcast, setPodcast] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`http://localhost:5000/api/podcasts/${id}`)
      .then(res => setPodcast(res.data))
      .catch(() => setError('Failed to load podcast'));
  }, [id]);

  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!podcast) return <div className="p-6">Loading podcast...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-6 mb-6">
        <img src={podcast.coverUrl} alt={podcast.title} className="w-40 h-40 rounded-lg object-cover" />
        <div>
          <h1 className="text-3xl font-bold">{podcast.title}</h1>
          <p className="text-lg text-gray-500">Host: {podcast.host}</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Episodes</h2>
      <ul className="space-y-3">
        {podcast.episodes.map(episode => (
          <li
            key={episode.id}
            className="p-3 rounded-md bg-gray-100 hover:bg-gray-200 cursor-pointer"
            onClick={() =>
              setCurrentTrack({
                title: episode.title,
                artist: podcast.host,
                image: podcast.coverUrl,
                audioUrl: episode.audioUrl
              })
            }
          >
            🎙 {episode.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PodcastDetail;