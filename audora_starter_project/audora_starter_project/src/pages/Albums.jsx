import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Music, Upload, Plus, Search } from 'lucide-react';
import MainLayout from '../layout/MainLayout';
import AlbumCard from '../components/AlbumCard';
import { useAuth } from '../context/AuthContext';
import { albums } from '../utils/mockData';
import { 
  FadeIn, SlideUp, StaggerContainer, StaggerItem 
} from '../components/MotionComponents';
import Button from '../components/ui/Button';

const Albums = ({ setCurrentTrack }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [allAlbums, setAllAlbums] = useState([]);
  const [userAlbums, setUserAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Check URL parameters for tab selection
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    
    if (tabParam === 'myAlbums' && isAuthenticated) {
      console.log('Setting active tab to myAlbums from URL parameter');
      setActiveTab('myAlbums');
    }
  }, [location.search, isAuthenticated]);

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
          artist: "Various Artists",
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
          artist: user?.name || "User",
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

  // Load all albums and user albums
  useEffect(() => {
    // Simulate loading data from backend
    const timer = setTimeout(() => {
      setAllAlbums(albums);
      
      // Only load user albums if authenticated
      if (isAuthenticated) {
        const userAlbumsData = loadUserAlbums();
        setUserAlbums(userAlbumsData);
        console.log('User is authenticated, loaded albums:', userAlbumsData);
      } else {
        setUserAlbums([]);
        console.log('User is not authenticated, no albums loaded');
      }
      
      setLoading(false);
      
      // After initial load, set first load to false after a delay
      setTimeout(() => {
        setIsFirstLoad(false);
      }, 2000);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [user, isAuthenticated]);

  // Set up a listener for album upload events
  useEffect(() => {
    const handleAlbumAdded = () => {
      try {
        console.log('Album added event detected, refreshing user albums');
        const savedAlbums = localStorage.getItem('userAlbums');
        if (savedAlbums) {
          const parsedAlbums = JSON.parse(savedAlbums);
          setUserAlbums(parsedAlbums);
          console.log('Updated user albums after add:', parsedAlbums);
          
          // Automatically switch to My Albums tab after adding a new album
          setActiveTab('myAlbums');
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
      console.log('Displaying all albums:', filteredAlbums.length);
    } else if (activeTab === 'myAlbums') {
      filteredAlbums = [...userAlbums];
      console.log('Displaying only user albums:', filteredAlbums.length);
    }
    
    if (filterQuery) {
      const query = filterQuery.toLowerCase();
      return filteredAlbums.filter(album => 
        album.title.toLowerCase().includes(query) || 
        album.artist.toLowerCase().includes(query)
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
      console.log('Refreshed user albums when switching to My Albums tab:', userAlbumsData);
    }
  };

  // For testing - manually add an album through the console
  useEffect(() => {
    if (isAuthenticated) {
      window.addTestAlbum = () => {
        const testAlbum = {
          id: Date.now(),
          title: "Test Album " + new Date().toLocaleTimeString(),
          artist: user?.name || "Test User",
          coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4",
          createdAt: new Date().toISOString(),
          userAdded: true,
          tracks: [
            {
              id: Date.now(),
              title: "Test Track",
              duration: 180,
              audioUrl: "https://res.cloudinary.com/dnbk3iouw/video/upload/v1746054425/after_hours_ded5tr.mp3"
            }
          ]
        };
        
        try {
          const existingAlbumsJSON = localStorage.getItem('userAlbums');
          let existingAlbums = [];
          
          if (existingAlbumsJSON) {
            existingAlbums = JSON.parse(existingAlbumsJSON);
          }
          
          const updatedAlbums = [...existingAlbums, testAlbum];
          localStorage.setItem('userAlbums', JSON.stringify(updatedAlbums));
          window.dispatchEvent(new Event('albumAdded'));
          console.log('Test album added successfully!', testAlbum);
          return 'Album added successfully! Check the My Albums tab.';
        } catch (error) {
          console.error('Error adding test album:', error);
        }
      };
      
      console.log('Test function added. Run window.addTestAlbum() in console to add a test album');
    }
    
    return () => {
      delete window.addTestAlbum;
    };
  }, [isAuthenticated, user]);

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
          </div>
          
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
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {displayedAlbums().map((album) => (
              <StaggerItem key={album.id}>
                <Link to={`/albums/${album.id}`}>
                  <div className="relative group">
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
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
            <Music size={64} className="text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No albums found</h3>
            <p className="text-gray-400">
              {activeTab === 'myAlbums' 
                ? "You haven't added any albums yet. Start by uploading your music!" 
                : "No albums match your search. Try a different query."}
            </p>
            {activeTab === 'myAlbums' && isAuthenticated && (
              <Link to="/admin-upload">
                <Button variant="primary" className="mt-4 flex items-center gap-2">
                  <Upload size={16} />
                  <span>Upload Music</span>
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Albums; 