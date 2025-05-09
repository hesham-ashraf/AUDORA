import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radio, Users, Play, Calendar, Clock, Mic } from 'lucide-react';
import MainLayout from '../layout/MainLayout';
import { FadeIn, StaggerContainer, StaggerItem } from '../components/MotionComponents';
import Button from '../components/ui/Button';

const LiveStreaming = ({ setCurrentTrack }) => {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [featuredStream, setFeaturedStream] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    // Mock data loading with timeout to simulate API call
    const timer = setTimeout(() => {
      try {
        // Mock data for demo
        const mockStreams = [
          {
            id: 1,
            title: 'Late Night Jazz',
            host: 'JazzMaster',
            coverUrl: 'https://images.unsplash.com/photo-1516223725307-6f76b9ec8742',
            streamUrl: 'https://stream.example.com/jazz',
            listeners: 1245,
            isLive: true,
            category: 'music',
            description: 'Smooth jazz for your evening relaxation. Join us for a journey through classic and contemporary jazz.',
            startTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4'
          },
          {
            id: 2,
            title: 'Morning Classical',
            host: 'ClassicalFM',
            coverUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76',
            streamUrl: 'https://stream.example.com/classical',
            listeners: 842,
            isLive: true,
            category: 'music',
            description: 'Start your day with beautiful classical masterpieces performed by world-renowned orchestras.',
            startTime: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
            thumbnail: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6'
          },
          {
            id: 3,
            title: 'Indie Spotlight',
            host: 'IndieVibes',
            coverUrl: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b',
            streamUrl: 'https://stream.example.com/indie',
            listeners: 623,
            isLive: true,
            category: 'music',
            description: 'Discover emerging indie artists and underground hits before they break into the mainstream.',
            startTime: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
            thumbnail: 'https://images.unsplash.com/photo-1501612780327-45045538702b'
          },
          {
            id: 4,
            title: 'Tech Talk Live',
            host: 'TechGuru',
            coverUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b',
            streamUrl: 'https://stream.example.com/tech',
            listeners: 532,
            isLive: true,
            category: 'talk',
            description: 'Live discussion about the latest in technology, gadgets, and digital trends.',
            startTime: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
            thumbnail: 'https://images.unsplash.com/photo-1535303311164-664fc9ec6532'
          },
          {
            id: 5,
            title: 'Wellness Hour',
            host: 'MindfulLiving',
            coverUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773',
            streamUrl: 'https://stream.example.com/wellness',
            listeners: 385,
            isLive: true,
            category: 'talk',
            description: 'Join us for guided meditation, wellness tips, and discussions on mental health.',
            startTime: new Date(Date.now() - 2700000).toISOString(), // 45 minutes ago
            thumbnail: 'https://images.unsplash.com/photo-1545389336-cf090694435e'
          }
        ];
        
        setStreams(mockStreams);
        // Set the first stream as featured
        setFeaturedStream(mockStreams[0]);
        setLoading(false);
      } catch (err) {
        console.error('Error loading streams:', err);
        setError('Failed to load live streams');
        setLoading(false);
      }
    }, 800);
    
    return () => clearTimeout(timer);
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

  const formatStreamTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filterStreamsByCategory = (category) => {
    setActiveCategory(category);
  };

  const filteredStreams = activeCategory === 'all' 
    ? streams 
    : streams.filter(stream => stream.category === activeCategory);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <FadeIn>
          <h1 className="text-2xl font-bold text-white mb-2">Live Streaming</h1>
          <p className="text-gray-400 mb-8">Listen to live music, talk shows, and more in real-time</p>
        </FadeIn>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 rounded-full border-t-2 border-b-2 border-primary-500 animate-spin mb-4"></div>
              <div className="h-4 bg-dark-100 rounded w-32"></div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-500/30 text-red-200 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* Featured Stream */}
            {featuredStream && (
              <div className="mb-10">
                <h2 className="text-xl font-semibold text-white mb-4">Featured Stream</h2>
                <div className="bg-gradient-to-r from-dark-200 to-dark-300 rounded-xl overflow-hidden shadow-lg">
                  <div className="relative aspect-video md:aspect-[2.4/1] overflow-hidden">
                    <img 
                      src={featuredStream.coverUrl} 
                      alt={featuredStream.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-400/90 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="flex items-center mb-2">
                        <span className="h-2 w-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                        <span className="text-xs font-medium bg-red-500/20 text-red-200 px-2 py-1 rounded-full">LIVE</span>
                        <span className="mx-2 text-gray-400">•</span>
                        <span className="text-xs text-gray-300 flex items-center">
                          <Users size={12} className="mr-1" />
                          {featuredStream.listeners.toLocaleString()} listening
                        </span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{featuredStream.title}</h3>
                      <p className="text-gray-300 mb-4 max-w-3xl">{featuredStream.description}</p>
                      <div className="flex flex-wrap gap-4 items-center">
                        <Button 
                          variant="primary" 
                          onClick={() => handleStreamClick(featuredStream)}
                          className="flex items-center gap-2"
                        >
                          <Play size={16} />
                          <span>Listen Now</span>
                        </Button>
                        <div className="text-gray-400 text-sm flex items-center">
                          <Mic size={14} className="mr-1" />
                          <span>Hosted by {featuredStream.host}</span>
                        </div>
                        <div className="text-gray-400 text-sm flex items-center">
                          <Clock size={14} className="mr-1" />
                          <span>Started at {formatStreamTime(featuredStream.startTime)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Categories Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Button 
                variant={activeCategory === 'all' ? 'primary' : 'glass'} 
                onClick={() => filterStreamsByCategory('all')}
                className="flex items-center gap-2"
              >
                <Radio size={16} />
                <span>All Streams</span>
              </Button>
              <Button 
                variant={activeCategory === 'music' ? 'primary' : 'glass'} 
                onClick={() => filterStreamsByCategory('music')}
                className="flex items-center gap-2"
              >
                <Play size={16} />
                <span>Music</span>
              </Button>
              <Button 
                variant={activeCategory === 'talk' ? 'primary' : 'glass'} 
                onClick={() => filterStreamsByCategory('talk')}
                className="flex items-center gap-2"
              >
                <Mic size={16} />
                <span>Talk Shows</span>
              </Button>
            </div>
            
            {/* Live Streams Grid */}
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStreams.map((stream) => (
                <StaggerItem key={stream.id}>
                  <motion.div 
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="bg-dark-200/80 rounded-lg overflow-hidden cursor-pointer shadow-md hover:shadow-lg transition-all duration-200 border border-white/5"
                    onClick={() => handleStreamClick(stream)}
                  >
                    <div className="relative">
                      <img 
                        src={stream.thumbnail || stream.coverUrl} 
                        alt={stream.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-red-600/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center">
                        <span className="h-2 w-2 bg-white rounded-full mr-1 animate-pulse"></span>
                        LIVE
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-white mb-1">{stream.title}</h3>
                      <p className="text-gray-400 text-sm mb-3">Hosted by {stream.host}</p>
                      
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center text-gray-500">
                          <Users size={14} className="mr-1" />
                          <span>{stream.listeners.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center text-gray-500">
                          <Clock size={14} className="mr-1" />
                          <span>{formatStreamTime(stream.startTime)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
            
            {filteredStreams.length === 0 && (
              <div className="text-center py-10">
                <Radio size={48} className="text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No streams found</h3>
                <p className="text-gray-400">
                  {activeCategory !== 'all' 
                    ? `There are no live ${activeCategory} streams at the moment.` 
                    : 'There are no live streams available right now.'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default LiveStreaming; 