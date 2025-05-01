import React, { useEffect, useState } from 'react';
import MainLayout from '../layout/MainLayout';
import AlbumCard from '../components/AlbumCard';
import axios from 'axios';
import { albums as albumsData, podcasts as podcastsData } from '../utils/mockData';
import { Link } from 'react-router-dom';

const Search = ({ setCurrentTrack }) => {
  const [albums, setAlbums] = useState([]);
  const [podcasts, setPodcasts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch data once
  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setAlbums(albumsData);
      setPodcasts(podcastsData);
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
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

  // Get suggestions if there's a search term
  const getSuggestions = () => {
    if (debouncedSearchTerm.length < 2) return [];
    
    const suggestions = [];
    
    // Add album artists
    albums.forEach(album => {
      if (album.artist.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) &&
          !suggestions.includes(album.artist)) {
        suggestions.push(album.artist);
      }
    });
    
    // Add podcast hosts
    podcasts.forEach(podcast => {
      if (podcast.host.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) &&
          !suggestions.includes(podcast.host)) {
        suggestions.push(podcast.host);
      }
    });
    
    return suggestions.slice(0, 5); // Limit to 5 suggestions
  };
  
  const suggestions = getSuggestions();

  return (
    <MainLayout>
      <div className="flex flex-col">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Search</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search for songs, artists, or podcasts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded-full text-sm w-full max-w-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            
            {suggestions.length > 0 && (
              <div className="absolute z-10 w-full max-w-xl bg-white shadow-lg rounded-md mt-1 border border-gray-200">
                {suggestions.map((suggestion, index) => (
                  <div 
                    key={index} 
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    onClick={() => setSearchTerm(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Loading content...</p>
          </div>
        ) : debouncedSearchTerm ? (
          <>
            {filteredAlbums.length === 0 && filteredPodcasts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">No results found for "{debouncedSearchTerm}"</p>
                <p className="text-gray-400 mt-2">Try a different search term or browse our content</p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-semibold mb-4 mt-4">Albums</h3>
                {filteredAlbums.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
                    {filteredAlbums.map((album) => (
                      <Link to={`/albums/${album.id}`} key={`album-${album.id}`}>
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
                ) : (
                  <p className="text-gray-500 mb-8">No albums match your search.</p>
                )}

                <h3 className="text-xl font-semibold mb-4">Podcasts</h3>
                {filteredPodcasts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredPodcasts.map((podcast) => (
                      <Link to={`/podcasts/${podcast.id}`} key={`podcast-${podcast.id}`} className="group">
                        <div className="bg-white rounded-md overflow-hidden shadow hover:shadow-md transition-all duration-200">
                          <div className="aspect-square overflow-hidden">
                            <img
                              src={podcast.coverUrl}
                              alt={podcast.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="p-4">
                            <h4 className="font-semibold text-lg truncate">{podcast.title}</h4>
                            <p className="text-sm text-gray-600 truncate">Host: {podcast.host}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {podcast.episodes?.length || 0} episode{podcast.episodes?.length !== 1 ? 's' : ''}
                            </p>
                            <button 
                              className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded-full text-sm flex items-center justify-center gap-1"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentTrack({
                                  title: podcast.episodes?.[0]?.title || podcast.title,
                                  artist: podcast.host,
                                  image: podcast.coverUrl,
                                  audioUrl: podcast.episodes?.[0]?.audioUrl || ''
                                });
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                              </svg>
                              Play
                            </button>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No podcasts match your search.</p>
                )}
              </>
            )}
          </>
        ) : (
          <div className="py-12 text-center">
            <h3 className="text-xl font-semibold mb-3">Popular Categories</h3>
            <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto mb-8">
              {['Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Jazz', 'Classical', 'R&B', 'Country', 
                'Technology', 'True Crime', 'Health', 'Business', 'Comedy'].map(category => (
                <div 
                  key={category}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-full cursor-pointer"
                  onClick={() => setSearchTerm(category)}
                >
                  {category}
                </div>
              ))}
            </div>
            
            <h3 className="text-xl font-semibold mb-4 mt-8">Browse All</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <Link to="/albums" className="bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg p-6 text-white hover:shadow-lg transition-all">
                <h4 className="text-xl font-bold">Albums</h4>
                <p className="mt-2 text-white/80">Explore our music collection</p>
              </Link>
              <Link to="/podcasts" className="bg-gradient-to-br from-green-500 to-teal-500 rounded-lg p-6 text-white hover:shadow-lg transition-all">
                <h4 className="text-xl font-bold">Podcasts</h4>
                <p className="mt-2 text-white/80">Discover interesting shows</p>
              </Link>
              <Link to="/playlists" className="bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg p-6 text-white hover:shadow-lg transition-all">
                <h4 className="text-xl font-bold">Playlists</h4>
                <p className="mt-2 text-white/80">Browse curated playlists</p>
              </Link>
              <Link to="/live-streaming" className="bg-gradient-to-br from-red-600 to-purple-600 rounded-lg p-6 text-white hover:shadow-lg transition-all">
                <h4 className="text-xl font-bold">Live</h4>
                <p className="mt-2 text-white/80">Join live streaming sessions</p>
              </Link>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Search;