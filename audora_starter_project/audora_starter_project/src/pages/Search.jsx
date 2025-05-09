import React, { useEffect, useState, useCallback } from 'react';
import MainLayout from '../layout/MainLayout';
import AlbumCard from '../components/AlbumCard';
import { Search as SearchIcon, X, Mic, Music, User, Disc, Radio } from 'lucide-react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { albums as albumsData, podcasts as podcastsData } from '../utils/mockData';
import { debounce } from 'lodash';
import { useAuth } from '../context/AuthContext';

const Search = ({ setCurrentTrack }) => {
  const { user, isAuthenticated } = useAuth();
  const [searchResults, setSearchResults] = useState({
    albums: [],
    tracks: [],
    artists: [],
    podcasts: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch search history if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchSearchHistory();
    }
  }, [isAuthenticated, user]);

  const fetchSearchHistory = async () => {
    try {
      const response = await api.get('/search/history');
      setSearchHistory(response.data.history || []);
    } catch (error) {
      console.error('Error fetching search history:', error);
    }
  };

  // Save search to history
  const saveToHistory = async (query) => {
    if (!isAuthenticated || !query) return;
    
    try {
      await api.post('/search/history', { query });
      fetchSearchHistory();
    } catch (error) {
      console.error('Error saving search to history:', error);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (term) => {
      if (!term || term.length < 2) {
        setSearchResults({
          albums: [],
          tracks: [],
          artists: [],
          podcasts: []
        });
        setIsLoading(false);
        return;
      }

      try {
        const typeParam = activeTab !== 'all' ? `&type=${activeTab}` : '';
        const response = await api.get(`/search?query=${encodeURIComponent(term)}${typeParam}`);
        setSearchResults(response.data);
      } catch (error) {
        console.error('Search error:', error);
        
        // Fallback to mock data if API fails
        if (activeTab === 'all' || activeTab === 'albums') {
          const filteredAlbums = albumsData.filter(album =>
            album.title.toLowerCase().includes(term.toLowerCase()) ||
            album.artist.toLowerCase().includes(term.toLowerCase())
          );
          setSearchResults(prev => ({ ...prev, albums: filteredAlbums }));
        }
        
        if (activeTab === 'all' || activeTab === 'podcasts') {
          const filteredPodcasts = podcastsData.filter(podcast =>
            podcast.title.toLowerCase().includes(term.toLowerCase()) ||
            podcast.host.toLowerCase().includes(term.toLowerCase())
          );
          setSearchResults(prev => ({ ...prev, podcasts: filteredPodcasts }));
        }
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [activeTab]
  );

  // Debounced autocomplete function
  const debouncedAutocomplete = useCallback(
    debounce(async (term) => {
      if (!term || term.length < 2) {
        setAutocompleteSuggestions([]);
        return;
      }

      try {
        const response = await api.get(`/search/autocomplete?query=${encodeURIComponent(term)}`);
        setAutocompleteSuggestions(response.data.suggestions || []);
      } catch (error) {
        console.error('Autocomplete error:', error);
        
        // Fallback suggestions from mock data
        const albums = albumsData.filter(album => 
          album.title.toLowerCase().startsWith(term.toLowerCase())
        ).slice(0, 3);
        
        const artists = [...new Set(albumsData.map(album => album.artist))]
          .filter(artist => artist.toLowerCase().startsWith(term.toLowerCase()))
          .slice(0, 3);
        
        const suggestions = [
          ...albums.map(album => ({ text: album.title, type: 'album' })),
          ...artists.map(artist => ({ text: artist, type: 'artist' }))
        ];
        
        setAutocompleteSuggestions(suggestions);
      }
    }, 150),
    []
  );

  // Manage search term changes
  useEffect(() => {
    if (searchTerm.length >= 2) {
      setIsLoading(true);
      debouncedAutocomplete(searchTerm);
    } else {
      setAutocompleteSuggestions([]);
    }
  }, [searchTerm, debouncedAutocomplete]);

  // Perform search when debounced term changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      debouncedSearch(debouncedSearchTerm);
      saveToHistory(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, debouncedSearch]);

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim() === '') {
      setDebouncedSearchTerm('');
      setShowSuggestions(false);
    } else {
      setShowSuggestions(true);
    }
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setDebouncedSearchTerm(searchTerm);
    setShowSuggestions(false);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion.text);
    setDebouncedSearchTerm(suggestion.text);
    setShowSuggestions(false);
    
    if (suggestion.type !== 'all') {
      setActiveTab(suggestion.type + 's');
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (debouncedSearchTerm) {
      debouncedSearch(debouncedSearchTerm);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setSearchResults({
      albums: [],
      tracks: [],
      artists: [],
      podcasts: []
    });
  };

  // Play a track
  const playTrack = (track, album) => {
    setCurrentTrack({
      title: track.title,
      artist: album.artist.name,
      image: album.coverUrl,
      audioUrl: track.audioUrl
    });
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="relative mb-8">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search for songs, artists, albums..."
                className="w-full p-4 pr-12 pl-12 bg-dark-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-white"
                onFocus={() => setShowSuggestions(!!searchTerm)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              )}
            </div>
            
            {/* Autocomplete suggestions */}
            {showSuggestions && autocompleteSuggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-dark-200 border border-dark-100 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                <ul>
                  {autocompleteSuggestions.map((suggestion, index) => (
                    <li 
                      key={`${suggestion.text}-${index}`}
                      className="px-4 py-3 hover:bg-dark-100 cursor-pointer flex items-center gap-3"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion.type === 'album' && <Disc size={16} className="text-primary-400" />}
                      {suggestion.type === 'artist' && <User size={16} className="text-primary-400" />}
                      {suggestion.type === 'track' && <Music size={16} className="text-primary-400" />}
                      {suggestion.type === 'podcast' && <Radio size={16} className="text-primary-400" />}
                      <span>{suggestion.text}</span>
                      <span className="text-xs text-gray-500 ml-auto">
                        {suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </form>
        </div>
        
        {/* Tab navigation when searching */}
        {debouncedSearchTerm && (
          <div className="flex gap-4 mb-6 border-b border-dark-100">
            <button
              className={`py-3 px-1 relative ${activeTab === 'all' ? 'text-primary-500 font-medium' : 'text-gray-400'}`}
              onClick={() => handleTabChange('all')}
            >
              All
              {activeTab === 'all' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-t-lg"></div>}
            </button>
            <button
              className={`py-3 px-1 relative ${activeTab === 'albums' ? 'text-primary-500 font-medium' : 'text-gray-400'}`}
              onClick={() => handleTabChange('albums')}
            >
              Albums
              {activeTab === 'albums' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-t-lg"></div>}
            </button>
            <button
              className={`py-3 px-1 relative ${activeTab === 'tracks' ? 'text-primary-500 font-medium' : 'text-gray-400'}`}
              onClick={() => handleTabChange('tracks')}
            >
              Tracks
              {activeTab === 'tracks' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-t-lg"></div>}
            </button>
            <button
              className={`py-3 px-1 relative ${activeTab === 'artists' ? 'text-primary-500 font-medium' : 'text-gray-400'}`}
              onClick={() => handleTabChange('artists')}
            >
              Artists
              {activeTab === 'artists' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-t-lg"></div>}
            </button>
            <button
              className={`py-3 px-1 relative ${activeTab === 'podcasts' ? 'text-primary-500 font-medium' : 'text-gray-400'}`}
              onClick={() => handleTabChange('podcasts')}
            >
              Podcasts
              {activeTab === 'podcasts' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-t-lg"></div>}
            </button>
          </div>
        )}
        
        {/* Search Results */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : debouncedSearchTerm ? (
          <>
            {/* No results */}
            {!searchResults.albums?.length && 
             !searchResults.tracks?.length && 
             !searchResults.artists?.length && 
             !searchResults.podcasts?.length && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">No results found for "{debouncedSearchTerm}"</p>
                <p className="text-gray-400 mt-2">Try a different search term or browse our content</p>
              </div>
            )}
            
            {/* Albums */}
            {(activeTab === 'all' || activeTab === 'albums') && searchResults.albums?.length > 0 && (
              <div className="mb-10">
                <h3 className="text-xl font-semibold mb-4">Albums</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {searchResults.albums.map((album) => (
                    <Link to={`/albums/${album.id}`} key={`album-${album.id}`}>
                      <AlbumCard
                        title={album.title}
                        artist={album.artist?.name || album.artist}
                        image={album.coverUrl}
                        onClick={() => {
                          setCurrentTrack({
                            title: album.title,
                            artist: album.artist?.name || album.artist,
                            image: album.coverUrl,
                            audioUrl: album.tracks?.[0]?.audioUrl || ''
                          });
                        }}
                      />
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            {/* Tracks */}
            {(activeTab === 'all' || activeTab === 'tracks') && searchResults.tracks?.length > 0 && (
              <div className="mb-10">
                <h3 className="text-xl font-semibold mb-4">Tracks</h3>
                <div className="bg-dark-200 rounded-lg overflow-hidden">
                  {searchResults.tracks.map((track, index) => (
                    <div 
                      key={`track-${track.id}`}
                      onClick={() => playTrack(track, track.album)}
                      className="flex items-center p-4 hover:bg-dark-100 cursor-pointer border-b border-dark-300 last:border-b-0"
                    >
                      <div className="w-10 h-10 flex-shrink-0 mr-4">
                        <img 
                          src={track.album?.coverUrl} 
                          alt={track.title} 
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white truncate">{track.title}</h4>
                        <p className="text-sm text-gray-400 truncate">{track.album?.artist?.name || track.album?.artist}</p>
                      </div>
                      <div className="text-sm text-gray-500 ml-4">
                        {track.duration ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}` : '--:--'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Artists */}
            {(activeTab === 'all' || activeTab === 'artists') && searchResults.artists?.length > 0 && (
              <div className="mb-10">
                <h3 className="text-xl font-semibold mb-4">Artists</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {searchResults.artists.map((artist) => (
                    <Link to={`/artists/${artist.id}`} key={`artist-${artist.id}`} className="group">
                      <div className="bg-dark-200 rounded-lg p-4 text-center transition-all hover:bg-dark-100">
                        <div className="w-24 h-24 mx-auto rounded-full overflow-hidden mb-3">
                          <img 
                            src={artist.imageUrl || `https://i.pravatar.cc/150?u=${artist.name}`} 
                            alt={artist.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <h4 className="font-medium text-white truncate">{artist.name}</h4>
                        <p className="text-xs text-gray-400">{artist._count?.albums || 0} albums</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            {/* Podcasts */}
            {(activeTab === 'all' || activeTab === 'podcasts') && searchResults.podcasts?.length > 0 && (
              <div className="mb-10">
                <h3 className="text-xl font-semibold mb-4">Podcasts</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {searchResults.podcasts.map((podcast) => (
                    <Link to={`/podcasts/${podcast.id}`} key={`podcast-${podcast.id}`} className="group">
                      <div className="bg-dark-200 rounded-lg overflow-hidden">
                        <div className="aspect-square overflow-hidden">
                          <img 
                            src={podcast.coverUrl} 
                            alt={podcast.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium text-white truncate">{podcast.title}</h3>
                          <p className="text-sm text-gray-400 truncate">Host: {podcast.host?.name || podcast.host}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {podcast.episodes?.length || 0} episode{podcast.episodes?.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="py-12 text-center">
            {/* Recent Searches (if authenticated) */}
            {isAuthenticated && searchHistory.length > 0 && (
              <div className="mb-10">
                <h3 className="text-xl font-semibold mb-4">Recent Searches</h3>
                <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
                  {searchHistory.map((item, index) => (
                    <button
                      key={`history-${index}`}
                      className="px-4 py-2 bg-dark-100 hover:bg-dark-200 text-white rounded-full transition-colors"
                      onClick={() => {
                        setSearchTerm(item.query);
                        setDebouncedSearchTerm(item.query);
                      }}
                    >
                      {item.query}
                    </button>
                  ))}
                </div>
              </div>
            )}
          
            <h3 className="text-xl font-semibold mb-3">Popular Categories</h3>
            <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto mb-8">
              {['Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Jazz', 'Classical', 'R&B', 'Country', 
                'Technology', 'True Crime', 'Health', 'Business', 'Comedy'].map(category => (
                <div 
                  key={category}
                  className="px-6 py-3 bg-dark-100 hover:bg-dark-200 text-white font-medium rounded-full cursor-pointer transition-colors"
                  onClick={() => {
                    setSearchTerm(category);
                    setDebouncedSearchTerm(category);
                  }}
                >
                  {category}
                </div>
              ))}
            </div>
            
            <h3 className="text-xl font-semibold mb-4 mt-8">Browse All</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <Link to="/albums" className="bg-dark-100 hover:bg-dark-200 p-8 rounded-lg flex flex-col items-center transition-colors">
                <Disc size={40} className="mb-4 text-primary-500" />
                <span className="text-lg font-medium">Albums</span>
              </Link>
              <Link to="/artists" className="bg-dark-100 hover:bg-dark-200 p-8 rounded-lg flex flex-col items-center transition-colors">
                <User size={40} className="mb-4 text-primary-500" />
                <span className="text-lg font-medium">Artists</span>
              </Link>
              <Link to="/podcasts" className="bg-dark-100 hover:bg-dark-200 p-8 rounded-lg flex flex-col items-center transition-colors">
                <Radio size={40} className="mb-4 text-primary-500" />
                <span className="text-lg font-medium">Podcasts</span>
              </Link>
              <Link to="/playlists" className="bg-dark-100 hover:bg-dark-200 p-8 rounded-lg flex flex-col items-center transition-colors">
                <Music size={40} className="mb-4 text-primary-500" />
                <span className="text-lg font-medium">Playlists</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Search;