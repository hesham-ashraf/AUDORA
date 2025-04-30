import React, { useEffect, useState } from 'react';
import MainLayout from '../layout/MainLayout';
import AlbumCard from '../components/AlbumCard';
import axios from 'axios';

const Search = ({ setCurrentTrack }) => {
  const [albums, setAlbums] = useState([]);
  const [podcasts, setPodcasts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch data once
  useEffect(() => {
    axios.get('http://localhost:5000/api/albums')
      .then(res => setAlbums(res.data))
      .catch(() => setAlbums([]));

    axios.get('http://localhost:5000/api/podcasts')
      .then(res => setPodcasts(res.data))
      .catch(() => setPodcasts([]));
  }, []);

  // Filtered results
  const filteredAlbums = albums.filter(album =>
    album.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    album.artist.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  const filteredPodcasts = podcasts.filter(podcast =>
    podcast.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    podcast.host.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Search</h2>
        <input
          type="text"
          placeholder="Search songs, artists, or podcasts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 px-3 py-1 rounded-md text-sm w-64 focus:outline-none focus:ring focus:border-blue-500"
        />
      </div>

      {debouncedSearchTerm && (
        <>
          <h3 className="text-xl font-semibold mb-2 mt-4">Albums</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
            {filteredAlbums.map((album) => (
              <AlbumCard
                key={`album-${album.id}`}
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
            ))}
          </div>

          <h3 className="text-xl font-semibold mb-2">Podcasts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredPodcasts.map((podcast) => (
              <div
                key={`podcast-${podcast.id}`}
                className="bg-white rounded-md p-4 shadow hover:shadow-md transition cursor-pointer"
                onClick={() =>
                  setCurrentTrack({
                    title: podcast.episodes?.[0]?.title || podcast.title,
                    artist: podcast.host,
                    image: podcast.coverUrl,
                    audioUrl: podcast.episodes?.[0]?.audioUrl || ''
                  })
                }
              >
                <img
                  src={podcast.coverUrl}
                  alt={podcast.title}
                  className="rounded-md w-full h-40 object-cover mb-3"
                />
                <h4 className="text-lg font-semibold">{podcast.title}</h4>
                <p className="text-sm text-gray-500">Host: {podcast.host}</p>
              </div>
            ))}
          </div>

          {filteredAlbums.length === 0 && filteredPodcasts.length === 0 && (
            <p className="text-gray-500 text-sm mt-4">No results found.</p>
          )}
        </>
      )}
    </MainLayout>
  );
};

export default Search;