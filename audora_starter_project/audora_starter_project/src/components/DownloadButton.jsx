import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import offline from '../services/offline';

const DownloadButton = ({ track, album }) => {
  const [downloading, setDownloading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();

  const handleDownload = async () => {
    if (!isAuthenticated) {
      setError('Please login to download tracks for offline listening');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setDownloading(true);
    setError('');
    
    try {
      if (track) {
        await offline.saveTrackOffline(track);
      } else if (album) {
        await offline.saveAlbumOffline(album);
      }
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to download. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="flex items-center px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-md text-sm disabled:opacity-50"
      >
        {downloading ? (
          <span>Downloading...</span>
        ) : (
          <>
            <span className="mr-1">🔽</span>
            <span>{album ? 'Save Album Offline' : 'Download'}</span>
          </>
        )}
      </button>
      
      {error && (
        <div className="mt-2 text-xs text-red-500">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mt-2 text-xs text-green-500">
          {album ? 'Album saved for offline listening' : 'Track downloaded successfully'}
        </div>
      )}
    </div>
  );
};

export default DownloadButton; 