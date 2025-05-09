import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Music, Headphones, Clock, AlertTriangle } from 'lucide-react';
import MainLayout from '../layout/MainLayout';
import { FadeIn, StaggerContainer, StaggerItem } from '../components/MotionComponents';
import AlbumCard from '../components/AlbumCard';
import Button from '../components/ui/Button';

const OfflineLibrary = ({ setCurrentTrack }) => {
  const [offlineContent, setOfflineContent] = useState({
    albums: [],
    tracks: [],
    podcasts: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('albums');

  useEffect(() => {
    // In a real app, this would check for offline stored content
    // Simulating loading offline content from localStorage or IndexedDB
    const timer = setTimeout(() => {
      // Mock data for demo purposes
      const mockOfflineContent = {
        albums: [
          {
            id: 'offline-album-1',
            title: 'Midnight Journey',
            artist: 'Ethereal Dreams',
            coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819',
            downloadedAt: new Date().toISOString(),
            tracks: [
              { title: 'Into the Night', duration: '3:45', audioUrl: '/offline/track1.mp3' }
            ]
          },
          {
            id: 'offline-album-2',
            title: 'Urban Echoes',
            artist: 'City Pulse',
            coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4',
            downloadedAt: new Date(Date.now() - 86400000).toISOString(),
            tracks: [
              { title: 'Downtown Lights', duration: '4:12', audioUrl: '/offline/track2.mp3' }
            ]
          }
        ],
        tracks: [
          {
            id: 'offline-track-1',
            title: 'Ocean Waves',
            artist: 'Nature Sounds',
            coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
            duration: '5:22',
            downloadedAt: new Date().toISOString(),
            audioUrl: '/offline/ocean.mp3'
          },
          {
            id: 'offline-track-2',
            title: 'Mountain Air',
            artist: 'Nature Sounds',
            coverUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
            duration: '4:18',
            downloadedAt: new Date(Date.now() - 172800000).toISOString(),
            audioUrl: '/offline/mountain.mp3'
          }
        ],
        podcasts: [
          {
            id: 'offline-podcast-1',
            title: 'Tech Today',
            host: 'Sarah Johnson',
            coverUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
            downloadedAt: new Date().toISOString(),
            audioUrl: '/offline/podcast1.mp3',
            duration: '32:15'
          }
        ]
      };
      
      setOfflineContent(mockOfflineContent);
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  const handlePlayContent = (content) => {
    setCurrentTrack({
      title: content.title,
      artist: content.artist || content.host,
      image: content.coverUrl,
      audioUrl: content.audioUrl || content.tracks?.[0]?.audioUrl
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <FadeIn>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Offline Library</h1>
              <p className="text-gray-400">Access your downloaded content anytime, anywhere</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center bg-dark-100/50 rounded-lg p-2">
              <Download size={18} className="text-primary-400 mr-2" />
              <span className="text-gray-300 text-sm">
                {offlineContent.albums.length + offlineContent.tracks.length + offlineContent.podcasts.length} items downloaded
              </span>
            </div>
          </div>
        </FadeIn>

        {/* Tabs Navigation */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 border-b border-white/10 pb-2">
            <Button 
              variant={activeTab === 'albums' ? 'primary' : 'glass'} 
              onClick={() => setActiveTab('albums')}
              className="flex items-center gap-2"
            >
              <Music size={16} />
              <span>Albums</span>
            </Button>
            
            <Button 
              variant={activeTab === 'tracks' ? 'primary' : 'glass'} 
              onClick={() => setActiveTab('tracks')}
              className="flex items-center gap-2"
            >
              <Headphones size={16} />
              <span>Tracks</span>
            </Button>
            
            <Button 
              variant={activeTab === 'podcasts' ? 'primary' : 'glass'} 
              onClick={() => setActiveTab('podcasts')}
              className="flex items-center gap-2"
            >
              <Clock size={16} />
              <span>Podcasts</span>
            </Button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 rounded-full border-t-2 border-b-2 border-primary-500 animate-spin mb-4"></div>
              <div className="h-4 bg-dark-100 rounded w-32"></div>
            </div>
          </div>
        ) : (
          <div>
            {/* Albums Tab */}
            {activeTab === 'albums' && (
              <div>
                {offlineContent.albums.length > 0 ? (
                  <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {offlineContent.albums.map((album) => (
                      <StaggerItem key={album.id}>
                        <div onClick={() => handlePlayContent(album)} className="cursor-pointer">
                          <AlbumCard
                            title={album.title}
                            artist={album.artist}
                            image={album.coverUrl}
                          />
                          <div className="mt-1 text-xs text-gray-500 flex items-center">
                            <Download size={12} className="mr-1" />
                            <span>Downloaded {formatDate(album.downloadedAt)}</span>
                          </div>
                        </div>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertTriangle size={48} className="text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No Albums Downloaded</h3>
                    <p className="text-gray-400 mb-4 max-w-md">
                      You haven't downloaded any albums for offline listening yet.
                    </p>
                    <Link to="/albums">
                      <Button variant="primary" className="flex items-center gap-2">
                        <Music size={16} />
                        <span>Browse Albums</span>
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Tracks Tab */}
            {activeTab === 'tracks' && (
              <div>
                {offlineContent.tracks.length > 0 ? (
                  <div className="space-y-2">
                    {offlineContent.tracks.map((track) => (
                      <motion.div 
                        key={track.id}
                        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                        className="flex items-center gap-4 p-3 rounded-lg cursor-pointer"
                        onClick={() => handlePlayContent(track)}
                      >
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
                          {track.duration}
                        </div>
                        <Button 
                          variant="glass"
                          className="flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayContent(track);
                          }}
                        >
                          Play
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertTriangle size={48} className="text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No Tracks Downloaded</h3>
                    <p className="text-gray-400 mb-4 max-w-md">
                      You haven't downloaded any individual tracks for offline listening yet.
                    </p>
                    <Link to="/albums">
                      <Button variant="primary" className="flex items-center gap-2">
                        <Headphones size={16} />
                        <span>Browse Tracks</span>
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Podcasts Tab */}
            {activeTab === 'podcasts' && (
              <div>
                {offlineContent.podcasts.length > 0 ? (
                  <div className="space-y-4">
                    {offlineContent.podcasts.map((podcast) => (
                      <motion.div 
                        key={podcast.id}
                        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                        className="flex items-center gap-4 p-4 rounded-lg cursor-pointer border border-white/5"
                        onClick={() => handlePlayContent(podcast)}
                      >
                        <img 
                          src={podcast.coverUrl} 
                          alt={podcast.title} 
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white text-lg truncate">{podcast.title}</div>
                          <div className="text-gray-400 truncate">Host: {podcast.host}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            <span>{podcast.duration}</span>
                            <span className="mx-2">•</span>
                            <span>Downloaded {formatDate(podcast.downloadedAt)}</span>
                          </div>
                        </div>
                        <Button 
                          variant="glass"
                          className="flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayContent(podcast);
                          }}
                        >
                          Play
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertTriangle size={48} className="text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No Podcasts Downloaded</h3>
                    <p className="text-gray-400 mb-4 max-w-md">
                      You haven't downloaded any podcasts for offline listening yet.
                    </p>
                    <Link to="/podcasts">
                      <Button variant="primary" className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>Browse Podcasts</span>
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default OfflineLibrary; 