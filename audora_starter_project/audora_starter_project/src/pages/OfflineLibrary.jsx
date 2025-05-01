import React, { useEffect, useState } from 'react';
import MainLayout from '../layout/MainLayout';
import offline from '../services/offline';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const OfflineLibrary = ({ setCurrentTrack }) => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnlineStatus, setIsOnlineStatus] = useState(offline.isOnline());
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchOfflineContent = async () => {
      try {
        const offlineTracks = await offline.getAllOfflineTracks();
        setTracks(offlineTracks);
      } catch (error) {
        console.error('Error fetching offline content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOfflineContent();

    // Setup listeners for online/offline status
    const cleanup = offline.setupOfflineListeners(
      () => setIsOnlineStatus(true),
      () => setIsOnlineStatus(false)
    );

    return cleanup;
  }, []);

  // Create object URL for offline tracks
  const playOfflineTrack = (track) => {
    const blob = new Blob([track.audioData], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(blob);
    
    setCurrentTrack({
      title: track.title,
      artist: track.artist,
      image: track.image,
      audioUrl
    });
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Your Offline Library</h1>
          <div className={`px-3 py-1 rounded-full text-sm ${isOnlineStatus ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {isOnlineStatus ? 'Online' : 'Offline Mode'}
          </div>
        </div>

        {loading ? (
          <p>Loading your offline content...</p>
        ) : tracks.length === 0 ? (
          <div className="bg-gray-100 p-6 rounded-lg text-center">
            <p className="text-lg mb-2">No offline content found</p>
            <p className="text-gray-600">Download your favorite tracks to listen while offline</p>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold mb-4">Saved Tracks</h2>
            <ul className="space-y-2">
              {tracks.map(track => (
                <li
                  key={track.id}
                  className="p-3 bg-gray-100 rounded-md hover:bg-gray-200 cursor-pointer flex items-center"
                  onClick={() => playOfflineTrack(track)}
                >
                  {track.image && (
                    <img 
                      src={track.image} 
                      alt={track.title}
                      className="w-10 h-10 rounded-md object-cover mr-3"
                    />
                  )}
                  <div>
                    <div className="font-medium">{track.title}</div>
                    <div className="text-sm text-gray-600">{track.artist}</div>
                  </div>
                  <div className="ml-auto text-xs text-gray-500">
                    Saved on {new Date(track.savedAt).toLocaleDateString()}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default OfflineLibrary; 