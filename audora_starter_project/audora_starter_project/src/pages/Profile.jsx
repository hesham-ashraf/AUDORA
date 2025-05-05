import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Mail, Calendar, Edit, Music, Headphones, Clock, 
  Heart, LogOut, Save, Upload, PlusSquare, ListMusic, Settings
} from 'lucide-react';
import MainLayout from '../layout/MainLayout';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { 
  FadeIn, SlideUp, StaggerContainer, StaggerItem 
} from '../components/MotionComponents';
import AlbumCard from '../components/AlbumCard';

const Profile = ({ setCurrentTrack }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    bio: '',
    avatar: ''
  });
  const [loading, setLoading] = useState(true);
  const [userAlbums, setUserAlbums] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Load user data
    if (user) {
      setUserProfile({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || 'Music enthusiast and avid listener.',
        avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=5c7cfa&color=fff`
      });
    }

    // Load user albums from localStorage
    try {
      const savedAlbums = localStorage.getItem('userAlbums');
      if (savedAlbums) {
        const parsedAlbums = JSON.parse(savedAlbums);
        setUserAlbums(parsedAlbums);
      }
    } catch (error) {
      console.error('Error loading user albums:', error);
    }

    // Mock recently played data
    setRecentlyPlayed([
      {
        id: 201,
        title: "Last Played Track",
        artist: "Recent Artist",
        coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4",
        playedAt: new Date().toISOString()
      },
      {
        id: 202,
        title: "Another Recent Track",
        artist: "Popular Artist",
        coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819",
        playedAt: new Date(Date.now() - 3600000).toISOString()
      }
    ]);

    setLoading(false);
  }, [user, isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    
    // In a real app, this would call an API to update the profile
    console.log('Profile updated:', userProfile);
    
    // Exit edit mode
    setEditMode(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getJoinDate = () => {
    // This is a mock function - would use actual join date from user account
    return 'March 2025';
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-dark-100 h-24 w-24 mb-4"></div>
            <div className="h-6 bg-dark-100 rounded w-40 mb-2"></div>
            <div className="h-4 bg-dark-100 rounded w-60"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <FadeIn>
          <div className="relative bg-gradient-to-r from-dark-200 to-dark-300 rounded-xl overflow-hidden mb-8">
            {/* Profile header with gradient backdrop */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary-600/30 to-dark-400/90"></div>
            
            <div className="relative z-10 p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Avatar */}
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 shadow-xl"
                >
                  <img 
                    src={userProfile.avatar} 
                    alt={userProfile.name} 
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                
                {/* User info */}
                <div className="text-center md:text-left">
                  <h1 className="text-3xl font-bold text-white mb-2">{userProfile.name}</h1>
                  <div className="flex flex-col md:flex-row gap-2 md:gap-4 text-sm text-gray-300 mb-4">
                    <div className="flex items-center justify-center md:justify-start gap-1">
                      <Mail size={16} className="text-gray-400" />
                      <span>{userProfile.email}</span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-1">
                      <Calendar size={16} className="text-gray-400" />
                      <span>Joined {getJoinDate()}</span>
                    </div>
                  </div>
                  <p className="text-gray-400 max-w-2xl mb-4">{userProfile.bio}</p>
                  
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <Button 
                      variant="glass" 
                      onClick={() => setEditMode(true)}
                      className="flex items-center gap-2"
                      disabled={editMode}
                    >
                      <Edit size={16} />
                      <span>Edit Profile</span>
                    </Button>
                    
                    <Button 
                      variant="destructive" 
                      onClick={handleLogout}
                      className="flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
        
        {/* Edit Profile Modal */}
        {editMode && (
          <SlideUp>
            <div className="bg-dark-200/95 backdrop-blur-md rounded-lg border border-white/5 p-6 mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Edit Profile</h2>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={userProfile.name}
                    onChange={handleInputChange}
                    className="bg-dark-100 border border-white/10 rounded-lg w-full py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={userProfile.email}
                    onChange={handleInputChange}
                    className="bg-dark-100 border border-white/10 rounded-lg w-full py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Bio</label>
                  <textarea
                    name="bio"
                    value={userProfile.bio}
                    onChange={handleInputChange}
                    rows={3}
                    className="bg-dark-100 border border-white/10 rounded-lg w-full py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Avatar URL</label>
                  <input
                    type="text"
                    name="avatar"
                    value={userProfile.avatar}
                    onChange={handleInputChange}
                    className="bg-dark-100 border border-white/10 rounded-lg w-full py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200"
                  />
                </div>
                
                <div className="flex justify-end gap-2 pt-2">
                  <Button 
                    variant="glass" 
                    onClick={() => setEditMode(false)}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit"
                    className="flex items-center gap-2"
                  >
                    <Save size={16} />
                    <span>Save Profile</span>
                  </Button>
                </div>
              </form>
            </div>
          </SlideUp>
        )}
        
        {/* Profile Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 border-b border-white/10 pb-2">
            <Button 
              variant={activeTab === 'overview' ? 'primary' : 'glass'} 
              onClick={() => handleTabChange('overview')}
              className="flex items-center gap-2"
            >
              <User size={16} />
              <span>Overview</span>
            </Button>
            
            <Button 
              variant={activeTab === 'myMusic' ? 'primary' : 'glass'} 
              onClick={() => handleTabChange('myMusic')}
              className="flex items-center gap-2"
            >
              <Music size={16} />
              <span>My Music</span>
            </Button>
            
            <Button 
              variant={activeTab === 'playlists' ? 'primary' : 'glass'} 
              onClick={() => handleTabChange('playlists')}
              className="flex items-center gap-2"
            >
              <ListMusic size={16} />
              <span>Playlists</span>
            </Button>
            
            <Button 
              variant={activeTab === 'activity' ? 'primary' : 'glass'} 
              onClick={() => handleTabChange('activity')}
              className="flex items-center gap-2"
            >
              <Clock size={16} />
              <span>Activity</span>
            </Button>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="min-h-[50vh]">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stats Section */}
              <div className="bg-dark-200/80 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Your Activity</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-dark-100/50 border border-white/5 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-primary-400 mb-1">{userAlbums.length}</div>
                    <div className="text-sm text-gray-400">Albums Added</div>
                  </div>
                  <div className="bg-dark-100/50 border border-white/5 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-primary-400 mb-1">0</div>
                    <div className="text-sm text-gray-400">Playlists Created</div>
                  </div>
                  <div className="bg-dark-100/50 border border-white/5 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-primary-400 mb-1">0</div>
                    <div className="text-sm text-gray-400">Favorite Tracks</div>
                  </div>
                  <div className="bg-dark-100/50 border border-white/5 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-primary-400 mb-1">{recentlyPlayed.length}</div>
                    <div className="text-sm text-gray-400">Recently Played</div>
                  </div>
                </div>
              </div>
              
              {/* Recent Activity */}
              <div className="bg-dark-200/80 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Recently Played</h3>
                <div className="space-y-3">
                  {recentlyPlayed.map(track => (
                    <div key={track.id} className="flex items-center gap-3 bg-dark-100/50 rounded-lg p-2">
                      <img 
                        src={track.coverUrl} 
                        alt={track.title} 
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">{track.title}</div>
                        <div className="text-sm text-gray-400 truncate">{track.artist}</div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(track.playedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'myMusic' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Your Albums</h3>
                <Link 
                  to="/admin-upload" 
                  className="flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors"
                >
                  <Upload size={16} />
                  <span>Upload Album</span>
                </Link>
              </div>
              
              {userAlbums.length > 0 ? (
                <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {userAlbums.map((album) => (
                    <StaggerItem key={album.id}>
                      <Link to={`/albums/${album.id}`}>
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
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Music size={48} className="text-gray-600 mb-4" />
                  <h4 className="text-lg font-medium text-white mb-2">No Albums Added Yet</h4>
                  <p className="text-gray-400 mb-4">Start building your collection by uploading your own music.</p>
                  <Link to="/admin-upload">
                    <Button variant="primary" className="flex items-center gap-2">
                      <Upload size={16} />
                      <span>Upload Music</span>
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'playlists' && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <ListMusic size={48} className="text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Playlist Feature Coming Soon</h3>
              <p className="text-gray-400 mb-4">You'll be able to create and manage custom playlists.</p>
              <Button 
                variant="glass" 
                className="flex items-center gap-2"
                disabled
              >
                <PlusSquare size={16} />
                <span>Create Playlist</span>
              </Button>
            </div>
          )}
          
          {activeTab === 'activity' && (
            <div className="bg-dark-200/80 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Listening History</h3>
              
              {recentlyPlayed.length > 0 ? (
                <div className="space-y-3">
                  {recentlyPlayed.map(track => (
                    <div key={track.id} className="flex items-center gap-4 bg-dark-100/50 rounded-lg p-3">
                      <img 
                        src={track.coverUrl} 
                        alt={track.title} 
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white text-lg truncate">{track.title}</div>
                        <div className="text-gray-400 truncate">{track.artist}</div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(track.playedAt).toLocaleDateString()} at {' '}
                        {new Date(track.playedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <Button 
                        variant="glass"
                        className="flex-shrink-0"
                        onClick={() => {
                          setCurrentTrack({
                            title: track.title,
                            artist: track.artist,
                            image: track.coverUrl,
                            audioUrl: "https://res.cloudinary.com/dnbk3iouw/video/upload/v1746054425/after_hours_ded5tr.mp3"
                          });
                        }}
                      >
                        Play
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Clock size={36} className="text-gray-600 mb-4" />
                  <p className="text-gray-400">No listening activity recorded yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile; 