import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, Music, Headphones, ListMusic, Plus, X, Camera } from 'lucide-react';
import MainLayout from '../layout/MainLayout';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { FadeIn, SlideUp, SlideInLeft } from '../components/MotionComponents';

const AdminUpload = () => {
  const [activeTab, setActiveTab] = useState('album');
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <FadeIn>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Upload Content</h1>
            <p className="text-gray-400">Add your own music, podcasts, or playlists to your library</p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            <Button 
              variant={activeTab === 'album' ? 'primary' : 'glass'}
              onClick={() => setActiveTab('album')}
              className="flex items-center gap-2"
            >
              <Music size={18} />
              <span>Album</span>
            </Button>
            <Button 
              variant={activeTab === 'podcast' ? 'primary' : 'glass'}
              onClick={() => setActiveTab('podcast')}
              className="flex items-center gap-2"
            >
              <Headphones size={18} />
              <span>Podcast</span>
            </Button>
            <Button 
              variant={activeTab === 'playlist' ? 'primary' : 'glass'}
              onClick={() => setActiveTab('playlist')}
              className="flex items-center gap-2"
            >
              <ListMusic size={18} />
              <span>Playlist</span>
            </Button>
          </div>
        </FadeIn>

        <SlideUp>
          <div className="bg-dark-200/95 backdrop-blur-md rounded-lg border border-white/5 p-6">
            {activeTab === 'album' && <AlbumForm user={user} />}
            {activeTab === 'podcast' && <PodcastForm user={user} />}
            {activeTab === 'playlist' && <PlaylistForm user={user} />}
          </div>
        </SlideUp>
      </div>
    </MainLayout>
  );
};

const AlbumForm = ({ user }) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState(user?.name || '');
  const [coverUrl, setCoverUrl] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [tracks, setTracks] = useState([{ title: '', audioUrl: '', duration: 180 }]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Use a more descriptive success message
  const [successMessage, setSuccessMessage] = useState('');

  const handleTrackChange = (index, field, value) => {
    const newTracks = [...tracks];
    newTracks[index][field] = value;
    setTracks(newTracks);
  };

  const addTrack = () => setTracks([...tracks, { title: '', audioUrl: '', duration: 180 }]);
  
  const removeTrack = (index) => {
    if (tracks.length > 1) {
      setTracks(tracks.filter((_, i) => i !== index));
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveAlbumToLocalStorage = (newAlbum) => {
    try {
      // Get existing user albums from localStorage
      const existingAlbumsJSON = localStorage.getItem('userAlbums');
      let existingAlbums = [];
      
      if (existingAlbumsJSON) {
        existingAlbums = JSON.parse(existingAlbumsJSON);
      }
      
      console.log('Current user albums:', existingAlbums);
      console.log('Adding new album:', newAlbum);
      
      // Add the new album
      const updatedAlbums = [...existingAlbums, newAlbum];
      
      // Save back to localStorage
      localStorage.setItem('userAlbums', JSON.stringify(updatedAlbums));
      console.log('Updated localStorage with all albums:', updatedAlbums);
      
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('albumAdded'));
      console.log('Dispatched albumAdded event');
      
      return true;
    } catch (error) {
      console.error('Error saving album to localStorage:', error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    setSuccessMessage('');
    
    if (!title || !artist || (!coverUrl && !coverPreview) || tracks.some(track => !track.title || !track.audioUrl)) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }
    
    try {
      // In a real app, this would upload to a backend
      // For now, we'll simulate a successful upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a new album object
      const newAlbum = {
        id: Date.now(), // Use timestamp as a simple ID
        title,
        artist,
        coverUrl: coverPreview || coverUrl,
        createdAt: new Date().toISOString(),
        userAdded: true,
        tracks: tracks.map((track, index) => ({
          id: Date.now() + index + 1,
          title: track.title,
          duration: track.duration,
          audioUrl: track.audioUrl
        }))
      };
      
      // Save to localStorage
      const saved = saveAlbumToLocalStorage(newAlbum);
      
      if (saved) {
        setSuccess(true);
        setSuccessMessage(`Album "${title}" added to your collection!`);
        setLoading(false);
        
        // Show success message with album details for better feedback
        console.log(`Album "${title}" with ${tracks.length} tracks added successfully`);
        
        // Reset form
        setTitle('');
        setArtist(user?.name || '');
        setCoverUrl('');
        setCoverPreview('');
        setCoverFile(null);
        setTracks([{ title: '', audioUrl: '', duration: 180 }]);
        
        // Reset form after showing success message
        setTimeout(() => {
          // Navigate to albums page with URL parameter to select My Albums tab
          navigate('/albums?tab=myAlbums');
        }, 2000);
      } else {
        throw new Error('Failed to save album');
      }
    } catch (err) {
      setError('Failed to upload album. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-2">Album Title</label>
            <input 
              type="text" 
              placeholder="Enter album title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="bg-dark-100 border border-white/10 rounded-lg w-full py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200" 
              required 
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-2">Artist Name</label>
            <input 
              type="text" 
              placeholder="Enter artist name" 
              value={artist} 
              onChange={(e) => setArtist(e.target.value)} 
              className="bg-dark-100 border border-white/10 rounded-lg w-full py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200" 
              required 
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-2">Cover Image</label>
            <div className="flex items-center gap-4">
              <input 
                type="text" 
                placeholder="Or enter image URL" 
                value={coverUrl} 
                onChange={(e) => setCoverUrl(e.target.value)} 
                className="bg-dark-100 border border-white/10 rounded-lg w-full py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200" 
              />
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button
                  type="button"
                  className="bg-primary-600 hover:bg-primary-700 text-white p-2.5 rounded-lg transition-colors"
                >
                  <Camera size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center items-center">
          {(coverPreview || coverUrl) ? (
            <div className="relative group">
              <img 
                src={coverPreview || coverUrl} 
                alt="Album Cover Preview" 
                className="w-48 h-48 object-cover rounded-lg shadow-lg"
              />
              <div 
                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
              >
                <button
                  type="button"
                  onClick={() => {
                    setCoverPreview('');
                    setCoverUrl('');
                    setCoverFile(null);
                  }}
                  className="text-white p-2 bg-red-600 rounded-full"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="w-48 h-48 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center text-gray-400">
              <Camera size={32} className="mb-2" />
              <p className="text-sm text-center px-4">Upload album cover or enter URL</p>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Tracks</h3>
        <div className="space-y-3">
          {tracks.map((track, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex gap-2 items-center"
            >
              <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-3">
                <input 
                  type="text" 
                  placeholder="Track title" 
                  value={track.title} 
                  onChange={(e) => handleTrackChange(index, 'title', e.target.value)} 
                  className="bg-dark-100 border border-white/10 rounded-lg w-full py-2 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200" 
                  required 
                />
                <input 
                  type="text" 
                  placeholder="Audio URL or file path" 
                  value={track.audioUrl} 
                  onChange={(e) => handleTrackChange(index, 'audioUrl', e.target.value)} 
                  className="bg-dark-100 border border-white/10 rounded-lg w-full py-2 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200" 
                  required 
                />
              </div>
              <button 
                type="button" 
                onClick={() => removeTrack(index)} 
                className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-full hover:bg-white/10"
                disabled={tracks.length <= 1}
              >
                <X size={18} />
              </button>
            </motion.div>
          ))}
        </div>
        
        <button 
          type="button" 
          onClick={addTrack} 
          className="mt-4 flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors py-2"
        >
          <Plus size={18} />
          <span>Add Track</span>
        </button>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-white/10">
        {success && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-green-400 font-medium"
          >
            {successMessage || 'Album uploaded successfully! Redirecting...'}
          </motion.p>
        )}
        {error && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 font-medium"
          >
            {error}
          </motion.p>
        )}
        
        <Button 
          type="submit"
          variant="primary"
          className="flex items-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload size={18} />
              <span>Upload Album</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

const PodcastForm = ({ user }) => {
  // This is a simplified version - in production, this would be fully implemented
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Headphones size={64} className="text-primary-500 mb-4" />
      <h3 className="text-2xl font-bold text-white mb-2">Podcast Upload</h3>
      <p className="text-gray-400 max-w-md">
        Podcast upload functionality is coming soon! You'll be able to share your own podcast episodes with the Audora community.
      </p>
    </div>
  );
};

const PlaylistForm = ({ user }) => {
  // This is a simplified version - in production, this would be fully implemented
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <ListMusic size={64} className="text-primary-500 mb-4" />
      <h3 className="text-2xl font-bold text-white mb-2">Playlist Creation</h3>
      <p className="text-gray-400 max-w-md">
        Playlist creation is coming soon! You'll be able to create and share custom playlists with your favorite tracks.
      </p>
    </div>
  );
};

export default AdminUpload;