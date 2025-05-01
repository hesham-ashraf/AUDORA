import React, { useState, useEffect } from 'react';
import MainLayout from '../layout/MainLayout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const LiveStreaming = ({ setCurrentTrack }) => {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchLiveStreams = async () => {
      try {
        const response = await api.get('/live-streams');
        setStreams(response.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching live streams:', err);
        setError('Failed to load live streams');
        setStreams([]);
        setLoading(false);
      }
    };

    fetchLiveStreams();
    
    // Poll for new streams every 30 seconds
    const interval = setInterval(fetchLiveStreams, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleStreamClick = (stream) => {
    setCurrentTrack({
      title: stream.title,
      artist: stream.host,
      image: stream.coverUrl,
      audioUrl: stream.streamUrl,
      isLive: true
    });
  };

  // Mock data for demo
  const mockStreams = [
    {
      id: 1,
      title: 'Late Night Jazz',
      host: 'JazzMaster',
      coverUrl: 'https://images.unsplash.com/photo-1516223725307-6f76b9ec8742?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      streamUrl: 'https://stream.example.com/jazz',
      listeners: 1245,
      isLive: true
    },
    {
      id: 2,
      title: 'Morning Classical',
      host: 'ClassicalFM',
      coverUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      streamUrl: 'https://stream.example.com/classical',
      listeners: 842,
      isLive: true
    },
    {
      id: 3,
      title: 'Indie Spotlight',
      host: 'IndieVibes',
      coverUrl: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      streamUrl: 'https://stream.example.com/indie',
      listeners: 623,
      isLive: true
    }
  ];
  
  // Use mock data if API fails
  const displayStreams = streams.length > 0 ? streams : mockStreams;
  
  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Live Streams</h1>
        
        {loading ? (
          <p>Loading live streams...</p>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayStreams.map((stream) => (
              <div 
                key={stream.id}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => handleStreamClick(stream)}
              >
                <div className="relative">
                  <img 
                    src={stream.coverUrl} 
                    alt={stream.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full flex items-center">
                    <span className="h-2 w-2 bg-white rounded-full mr-1 animate-pulse"></span>
                    LIVE
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-1">{stream.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">Hosted by {stream.host}</p>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-1">👥</span>
                    <span>{stream.listeners.toLocaleString()} listeners</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default LiveStreaming; 