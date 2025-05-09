import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Music, Upload, Plus, Search, Filter, ArrowUpDown, MoreHorizontal } from 'lucide-react';
import MainLayout from '../layout/MainLayout';
import AlbumCard from '../components/AlbumCard';
import { useAuth } from '../context/AuthContext';
import { albums as mockAlbums } from '../utils/mockData';
import { 
  FadeIn, SlideUp, StaggerContainer, StaggerItem 
} from '../components/MotionComponents';
import Button from '../components/ui/Button';
import api from '../services/api';

const Albums = ({ setCurrentTrack }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [allAlbums, setAllAlbums] = useState([]);
  const [userAlbums, setUserAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Check URL parameters for tab selection and filters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    const genreParam = params.get('genre');
    const sortByParam = params.get('sortBy');
    const sortOrderParam = params.get('sortOrder');
    const pageParam = params.get('page');
    
    if (tabParam === 'myAlbums' && isAuthenticated) {
      setActiveTab('myAlbums');
    }
    
    if (genreParam) {
      setSelectedGenre(genreParam);
    }
    
    if (sortByParam) {
      setSortBy(sortByParam);
    }
    
    if (sortOrderParam) {
      setSortOrder(sortOrderParam);
    }
    
    if (pageParam) {
      setPagination(prev => ({ ...prev, page: parseInt(pageParam) }));
    }
  }, [location.search, isAuthenticated]);

  // Load genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await api.get('/albums/genres');
        setGenres(response.data);
      } catch (error) {
        console.error('Error fetching genres:', error);
        // Fallback to mock genres
        setGenres([
          { id: 1, name: 'Pop' },
          { id: 2, name: 'Rock' },
          { id: 3, name: 'Hip-Hop' },
          { id: 4, name: 'Electronic' },
          { id: 5, name: 'Jazz' },
          { id: 6, name: 'Classical' }
        ]);
      }
    };
    
    fetchGenres();
  }, []);

  // Function to load user albums from localStorage
  const loadUserAlbums = () => {
    try {
      const savedAlbums = localStorage.getItem('userAlbums');
      if (savedAlbums) {
        const parsedAlbums = JSON.parse(savedAlbums);
        console.log('Loaded user albums:', parsedAlbums);
        return parsedAlbums;
      }
      
      // If no saved albums found, use mock data and save it
      const mockUserAlbums = [
        {
          id: 101,
          title: "User's Favorite Mix",
          artist: { name: "Various Artists" },
          coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819",
          createdAt: new Date().toISOString(),
          userAdded: true,
          tracks: [
            {
              id: 101,
              title: "Personal Collection Track 1",
              duration: 215,
              audioUrl: "https://res.cloudinary.com/dnbk3iouw/video/upload/v1746054444/Billie_Eilish_-_WILDFLOWER_Official_Lyric_Video_evhsdd.mp3"
            }
          ]
        },
        {
          id: 102,
          title: "My Acoustic Sessions",
          artist: { name: user?.name || "User" },
          coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4",
          createdAt: new Date().toISOString(),
          userAdded: true,
          tracks: [
            {
              id: 102,
              title: "Acoustic Cover",
              duration: 190,
              audioUrl: "https://res.cloudinary.com/dnbk3iouw/video/upload/v1746054425/after_hours_ded5tr.mp3"
            }
          ]
        }
      ];
      
      localStorage.setItem('userAlbums', JSON.stringify(mockUserAlbums));
      console.log('Created and saved mock user albums:', mockUserAlbums);
      return mockUserAlbums;
    } catch (error) {
      console.error('Error loading user albums:', error);
      return [];
    }
  };

  // Update URL params with current filtering and sorting
  const updateUrlParams = (page = pagination.page) => {
    const params = new URLSearchParams();
    
    if (activeTab !== 'all') {
      params.set('tab', activeTab);
    }
    
    if (selectedGenre) {
      params.set('genre', selectedGenre);
    }
    
    if (sortBy !== 'title') {
      params.set('sortBy', sortBy);
    }
    
    if (sortOrder !== 'asc') {
      params.set('sortOrder', sortOrder);
    }
    
    if (page > 1) {
      params.set('page', page.toString());
    }
    
    const queryString = params.toString();
    navigate(queryString ? `?${queryString}` : '', { replace: true });
  };

  // Load all albums and user albums
  useEffect(() => {
    const fetchAlbums = async () => {
      setLoading(true);
      
      try {
        // Build query params for API request
        const params = new URLSearchParams();
        
        if (selectedGenre) {
          params.set('genre', selectedGenre);
        }
        
        params.set('sortBy', sortBy);
        params.set('sortOrder', sortOrder);
        params.set('page', pagination.page.toString());
        params.set('limit', pagination.limit.toString());
        
        const response = await api.get(`/albums?${params.toString()}`);
        setAllAlbums(response.data.data);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages
        }));
      } catch (error) {
        console.error('Error fetching albums:', error);
        // Fallback to mock data
        setAllAlbums(mockAlbums);
      }
      
      // Only load user albums if authenticated
      if (isAuthenticated) {
        const userAlbumsData = loadUserAlbums();
        setUserAlbums(userAlbumsData);
      } else {
        setUserAlbums([]);
      }
      
      setLoading(false);
      
      // After initial load, set first load to false after a delay
      setTimeout(() => {
        setIsFirstLoad(false);
      }, 2000);
    };
    
    fetchAlbums();
  }, [isAuthenticated, selectedGenre, sortBy, sortOrder, pagination.page, pagination.limit]);

  // Set up a listener for album upload events
  useEffect(() => {
    const handleAlbumAdded = () => {
      try {
        console.log('Album added event detected, refreshing user albums');
        const savedAlbums = localStorage.getItem('userAlbums');
        if (savedAlbums) {
          const parsedAlbums = JSON.parse(savedAlbums);
          setUserAlbums(parsedAlbums);
          
          // Automatically switch to My Albums tab after adding a new album
          setActiveTab('myAlbums');
          updateUrlParams();
        }
      } catch (error) {
        console.error('Error handling album added event:', error);
      }
    };
    
    // Listen for album upload event
    window.addEventListener('albumAdded', handleAlbumAdded);
    
    return () => {
      window.removeEventListener('albumAdded', handleAlbumAdded);
    };
  }, []);

  const displayedAlbums = () => {
    let filteredAlbums = [];
    
    if (activeTab === 'all') {
      filteredAlbums = [...allAlbums, ...userAlbums];
    } else if (activeTab === 'myAlbums') {
      filteredAlbums = [...userAlbums];
    }
    
    if (filterQuery) {
      const query = filterQuery.toLowerCase();
      return filteredAlbums.filter(album => 
        album.title.toLowerCase().includes(query) || 
        album.artist.name.toLowerCase().includes(query)
      );
    }
    
    return filteredAlbums;
  };

  const handleTabChange = (tab) => {
    console.log('Tab changed to:', tab);
    setActiveTab(tab);
    
    // Force a refresh of the displayed albums for the selected tab
    if (tab === 'myAlbums') {
      // Refresh user albums when switching to My Albums tab
      const userAlbumsData = loadUserAlbums();
      setUserAlbums(userAlbumsData);
    }
    
    // Reset filters when changing tabs
    setPagination(prev => ({ ...prev, page: 1 }));
    updateUrlParams(1);
  };

  const handleGenreChange = (genre) => {
    setSelectedGenre(genre);
    setPagination(prev => ({ ...prev, page: 1 }));
    updateUrlParams(1);
    setShowFilterOptions(false);
  };

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
    
    setPagination(prev => ({ ...prev, page: 1 }));
    updateUrlParams(1);
    setShowSortOptions(false);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    
    setPagination(prev => ({ ...prev, page: newPage }));
    updateUrlParams(newPage);
    
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <FadeIn>
          <div className="mb-8">
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold text-white mb-2"
            >
              Albums
            </motion.h1>
            <p className="text-gray-400">
              Discover new music or enjoy your own collection
              {isAuthenticated ? ` (${userAlbums.length} personal albums)` : ''}
            </p>
          </div>
        </FadeIn>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex space-x-2">
            <Button 
              variant={activeTab === 'all' ? 'primary' : 'glass'} 
              onClick={() => handleTabChange('all')}
              className={`flex items-center gap-2 transition-all duration-300 ${activeTab === 'all' ? 'shadow-lg shadow-primary-500/20' : ''}`}
            >
              <Music size={16} />
              <span>All Albums</span>
            </Button>
            
            <Button 
              variant={activeTab === 'myAlbums' ? 'primary' : 'glass'} 
              onClick={() => handleTabChange('myAlbums')}
              className={`flex items-center gap-2 relative transition-all duration-300 
                ${activeTab === 'myAlbums' ? 'shadow-lg shadow-primary-500/20' : ''}
                ${isFirstLoad && userAlbums.length > 0 ? 'animate-pulse' : ''}
              `}
              disabled={false}
            >
              <Plus size={16} />
              <span>My Albums</span>
              {userAlbums.length > 0 && (
                <span className={`bg-primary-700 text-xs rounded-full px-2 py-0.5 ml-1 ${isFirstLoad ? 'animate-bounce' : ''}`}>
                  {userAlbums.length}
                </span>
              )}
              {!isAuthenticated && (
                <div className="absolute inset-0 bg-dark-300/80 rounded-lg flex items-center justify-center">
                  <Link to="/login" className="text-xs text-primary-400 hover:underline">
                    Login to view
                  </Link>
                </div>
              )}
            </Button>
            
            {/* Filter button */}
            <div className="relative">
              <Button
                variant="glass"
                onClick={() => {
                  setShowFilterOptions(!showFilterOptions);
                  setShowSortOptions(false);
                }}
                className="flex items-center gap-2"
              >
                <Filter size={16} />
                <span className="hidden sm:inline">
                  {selectedGenre || 'Filter'}
                </span>
              </Button>
              
              {showFilterOptions && (
                <div className="absolute z-50 mt-2 w-48 bg-dark-200 rounded-lg shadow-lg border border-dark-100 overflow-hidden">
                  <div className="p-3 border-b border-dark-100">
                    <h4 className="text-sm font-semibold text-white">Filter by Genre</h4>
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    <button
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-dark-100 ${!selectedGenre ? 'text-primary-400' : 'text-gray-300'}`}
                      onClick={() => handleGenreChange('')}
                    >
                      All Genres
                    </button>
                    {genres.map(genre => (
                      <button
                        key={genre.id || genre.name}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-dark-100 ${selectedGenre === genre.name ? 'text-primary-400' : 'text-gray-300'}`}
                        onClick={() => handleGenreChange(genre.name)}
                      >
                        {genre.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Sort button */}
            <div className="relative">
              <Button
                variant="glass"
                onClick={() => {
                  setShowSortOptions(!showSortOptions);
                  setShowFilterOptions(false);
                }}
                className="flex items-center gap-2"
              >
                <ArrowUpDown size={16} />
                <span className="hidden sm:inline">
                  Sort
                </span>
              </Button>
              
              {showSortOptions && (
                <div className="absolute z-50 mt-2 w-48 bg-dark-200 rounded-lg shadow-lg border border-dark-100 overflow-hidden">
                  <div className="p-3 border-b border-dark-100">
                    <h4 className="text-sm font-semibold text-white">Sort Albums</h4>
                  </div>
                  <div className="py-1">
                    {[
                      { id: 'title', label: 'Album Title' },
                      { id: 'artist', label: 'Artist Name' },
                      { id: 'releaseDate', label: 'Release Date' },
                      { id: 'playCount', label: 'Popularity' }
                    ].map(option => (
                      <button
                        key={option.id}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-dark-100 flex items-center justify-between ${sortBy === option.id ? 'text-primary-400' : 'text-gray-300'}`}
                        onClick={() => handleSortChange(option.id)}
                      >
                        <span>{option.label}</span>
                        {sortBy === option.id && (
                          <span className="text-xs">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Search input */}
          <div className="relative w-full md:w-64">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search albums..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="bg-dark-100 border border-white/10 rounded-lg w-full py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200"
            />
          </div>
        </div>

        <div className="w-full border-b border-white/10 mb-6 pb-1">
          <p className="text-sm text-gray-400">
            {activeTab === 'all' ? (
              <>Showing all albums</>
            ) : (
              <>Showing only your personal albums</>
            )}
            <span className="text-primary-400 ml-2 font-medium">
              {activeTab === 'all' 
                ? `(${allAlbums.length + userAlbums.length} total)`
                : `(${userAlbums.length} albums)`
              }
            </span>
            {selectedGenre && (
              <span className="ml-2">
                • Filtered by <span className="text-primary-400">{selectedGenre}</span>
              </span>
            )}
          </p>
        </div>

        {isAuthenticated && (
          <SlideUp>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link 
                to="/admin-upload" 
                className="flex-1 flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-primary-600/20 to-primary-700/20 border border-primary-600/30 rounded-lg hover:bg-primary-600/30 transition-all duration-200"
              >
                <Upload size={20} className="text-primary-400" />
                <span className="text-primary-300 font-medium">Upload your own albums and tracks</span>
              </Link>
              
              {userAlbums.length === 0 && activeTab === 'myAlbums' && (
                <div className="flex-1 p-4 bg-dark-200/50 rounded-lg border border-white/10 flex items-center justify-center">
                  <p className="text-gray-400">
                    You haven't added any albums yet. Start by uploading your music!
                  </p>
                </div>
              )}
            </div>
          </SlideUp>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(10)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-dark-100 rounded-lg aspect-square mb-2"></div>
                <div className="h-4 bg-dark-100 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-dark-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : displayedAlbums().length > 0 ? (
          <>
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {displayedAlbums().map((album) => (
                <StaggerItem key={album.id}>
                  <Link to={`/albums/${album.id}`}>
                    <div className="relative group">
                      <AlbumCard
                        title={album.title}
                        artist={album.artist.name || album.artist}
                        image={album.coverThumbnail || album.coverUrl}
                        onClick={() =>
                          setCurrentTrack({
                            title: album.title,
                            artist: album.artist.name || album.artist,
                            image: album.coverUrl,
                            audioUrl: album.previewUrl || album.tracks?.[0]?.audioUrl || ''
                          })
                        }
                      />
                      {album.userAdded && (
                        <div className="absolute top-2 right-2 bg-primary-600 text-white text-xs px-2 py-1 rounded-full z-10">
                          My Upload
                        </div>
                      )}
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
            
            {/* Pagination controls */}
            {activeTab === 'all' && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-10">
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.page === 1}
                >
                  First
                </Button>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                
                <div className="flex items-center space-x-1">
                  {[...Array(Math.min(5, pagination.totalPages))].map((_, idx) => {
                    // Calculate page numbers to show
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = idx + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = idx + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + idx;
                    } else {
                      pageNum = pagination.page - 2 + idx;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pagination.page === pageNum ? "primary" : "glass"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-10 h-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </Button>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Last
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
            <Music size={64} className="text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No albums found</h3>
            <p className="text-gray-400">
              {activeTab === 'myAlbums' 
                ? "You haven't added any albums yet. Start by uploading your music!" 
                : "No albums match your search criteria. Try a different query or filter."}
            </p>
            {activeTab === 'myAlbums' && isAuthenticated && (
              <Link to="/admin-upload">
                <Button variant="primary" className="mt-4 flex items-center gap-2">
                  <Upload size={16} />
                  <span>Upload Music</span>
                </Button>
              </Link>
            )}
            {selectedGenre && (
              <Button 
                variant="glass" 
                className="mt-4"
                onClick={() => handleGenreChange('')}
              >
                Clear Genre Filter
              </Button>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Albums; 