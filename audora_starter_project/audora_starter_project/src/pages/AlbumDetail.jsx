import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import MainLayout from '../layout/MainLayout';
import DownloadButton from '../components/DownloadButton';
import { albums } from '../utils/mockData';
import { 
  SlideUp, FadeIn, SlideInLeft, SlideInRight, StaggerContainer, StaggerItem 
} from '../components/MotionComponents';
import {
  Play, Heart, Download, Clock, MoreHorizontal, MusicIcon,
  ExternalLink, Share2, Pause, Shuffle, Repeat
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const AlbumDetail = ({ setCurrentTrack }) => {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewsRefresh, setReviewsRefresh] = useState(0);
  const [activeTrackId, setActiveTrackId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [colorData, setColorData] = useState({
    primary: 'rgb(92, 124, 250)',
    secondary: 'rgb(30, 58, 138)'
  });

  useEffect(() => {
    // Simulate loading from API
    const timer = setTimeout(() => {
      const foundAlbum = albums.find(a => a.id === parseInt(id));
      if (foundAlbum) {
        setAlbum(foundAlbum);
        // In a real app, you'd extract colors from the album artwork
        // For now, use a random vibrant color from our primary palette
        const primaryColors = [
          'rgb(92, 124, 250)', // primary-500
          'rgb(76, 110, 245)', // primary-600
          'rgb(66, 99, 235)',  // primary-700
          'rgb(59, 91, 219)',  // primary-800
        ];
        const randomIndex = Math.floor(Math.random() * primaryColors.length);
        setColorData({
          primary: primaryColors[randomIndex],
          secondary: 'rgb(30, 58, 138)' // primary-950
        });
      } else {
        setError('Album not found');
      }
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [id]);

  const handleReviewSubmitted = () => {
    setReviewsRefresh(prev => prev + 1);
  };

  const playTrack = (track) => {
    setCurrentTrack({
              title: track.title,
              artist: album.artist,
              image: album.coverUrl,
              audioUrl: track.audioUrl
    });
    setActiveTrackId(track.id);
    setIsPlaying(true);
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Calculate total duration
  const getTotalDuration = () => {
    if (!album?.tracks?.length) return { minutes: 0, seconds: 0 };
    
    const totalSeconds = album.tracks.reduce((total, track) => total + track.duration, 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} hr ${minutes} min`;
    }
    return `${minutes} min`;
  };
  
  const playAllTracks = () => {
    if (album?.tracks?.length > 0) {
      playTrack(album.tracks[0]);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-48 h-48 bg-dark-100 rounded-lg mb-6"></div>
            <div className="h-8 bg-dark-100 rounded w-64 mb-4"></div>
            <div className="h-4 bg-dark-100 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 gap-3 w-full max-w-xl">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="h-16 bg-dark-100 rounded-lg w-full"></div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <MusicIcon size={64} className="mx-auto text-gray-500 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Album Not Found</h2>
            <p className="text-gray-400">{error}</p>
            <Button 
              variant="glass" 
              className="mt-6"
              onClick={() => navigate('/')}
            >
              Return Home
            </Button>
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="relative min-h-screen pb-24">
        {/* Album header with gradient overlay */}
        <div
          className="relative h-[45vh] overflow-hidden"
          style={{
            background: `linear-gradient(to bottom, ${colorData.primary}80, ${colorData.secondary})`,
          }}
        >
          {/* Blurred album art background */}
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.3, scale: 1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `url(${album.coverUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(60px)',
            }}
          />
          
          {/* Content overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-dark-300 z-10" />
          
          {/* Album info */}
          <div className="container mx-auto px-4 h-full flex items-end pb-6 relative z-20">
            <div className="flex flex-col md:flex-row items-end gap-6">
              <SlideInLeft>
                <motion.div
                  whileHover={{ scale: 1.03, rotate: 2 }}
                  className="shadow-2xl rounded-lg overflow-hidden w-48 h-48 flex-shrink-0 transition transform duration-300"
                >
                  <img 
                    src={album.coverUrl} 
                    alt={album.title} 
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </SlideInLeft>
              
              <SlideUp>
                <div className="text-white">
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="uppercase text-xs font-semibold opacity-90"
                  >
                    Album
                  </motion.span>
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl md:text-5xl font-bold mt-1 mb-2 text-shadow-sm"
                  >
                    {album.title}
                  </motion.h1>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center text-sm opacity-90"
                  >
                    <img 
                      src={`https://i.pravatar.cc/150?u=${album.artist}`} 
                      alt={album.artist} 
                      className="w-6 h-6 rounded-full mr-2"
                    />
                    <span>
                      {album.artist} • {album.tracks.length} songs • {getTotalDuration()}
                    </span>
                  </motion.div>
                </div>
              </SlideUp>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="container mx-auto px-4 relative -mt-20 z-30 pb-12">
          {/* Play controls */}
          <FadeIn delay={0.5}>
            <div className="flex items-center gap-4 mb-6">
              <motion.button 
                onClick={playAllTracks}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-14 h-14 flex items-center justify-center rounded-full bg-primary-500 hover:bg-primary-400 transition-all shadow-lg text-white"
                title="Play"
              >
                <Play fill="currentColor" size={24} />
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-dark-200/80 text-gray-300 hover:text-white transition-colors"
              >
                <Heart size={20} />
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-dark-200/80 text-gray-300 hover:text-white transition-colors"
              >
                <Download size={20} />
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-dark-200/80 text-gray-300 hover:text-white transition-colors"
              >
                <Share2 size={20} />
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-dark-200/80 text-gray-300 hover:text-white transition-colors ml-auto"
              >
                <MoreHorizontal size={20} />
              </motion.button>
            </div>
          </FadeIn>
          
          {/* Tracks list */}
          <Card variant="glass" className="mt-8 p-2">
            <div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_auto_auto] gap-4 text-gray-400 text-sm px-4 py-3 border-b border-white/5">
              <span className="w-8 text-center">#</span>
              <span>Title</span>
              <span className="hidden md:block">
                <Clock size={16} />
              </span>
              <span></span>
            </div>
            
            <StaggerContainer delayChildren={0.1} staggerChildren={0.05} className="divide-y divide-white/5">
              {album.tracks.map((track, index) => (
                <StaggerItem key={track.id}>
                  <motion.div
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                    className={`grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_auto_auto] gap-4 items-center p-3 rounded-md ${
                      activeTrackId === track.id 
                        ? 'bg-primary-600/20 text-primary-500' 
                        : 'text-white'
                    } group transition-colors cursor-pointer`}
                    onClick={() => playTrack(track)}
                  >
                    <div className="w-8 text-center flex justify-center">
                      <AnimatePresence mode="wait">
                        {activeTrackId === track.id ? (
                          <motion.div
                            key="playing"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            {isPlaying ? (
                              <motion.div
                                animate={{ 
                                  scale: [1, 1.2, 1],
                                }}
                                transition={{ 
                                  repeat: Infinity,
                                  duration: 2,
                                }}
                              >
                                <Pause size={16} fill="currentColor" />
                              </motion.div>
                            ) : (
                              <Play size={16} fill="currentColor" />
                            )}
                          </motion.div>
                        ) : (
                          <motion.div
                            key="number"
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-5 h-5 flex items-center justify-center"
                          >
                            <span className="group-hover:hidden">{index + 1}</span>
                            <Play size={16} className="hidden group-hover:block" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    <div>
                      <div className={`font-medium ${activeTrackId === track.id ? 'text-primary-500' : ''}`}>
                        {track.title}
                      </div>
                      <div className="text-sm text-gray-400">
                        {album.artist}
                      </div>
                    </div>
                    
                    <div className="hidden md:block text-gray-400">
                      {formatDuration(track.duration)}
                    </div>
                    
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-white/10">
                        <Heart size={16} />
                      </button>
                      <button className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-white/10">
                        <Download size={16} />
                      </button>
                      <button className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-white/10">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </Card>
          
          {/* About section */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <SlideInLeft className="md:col-span-2">
              <Card variant="glass">
                <Card.Header>
                  <h2 className="text-white text-xl font-bold">About {album.title}</h2>
                </Card.Header>
                <Card.Content className="text-gray-300 space-y-4">
                  <p>
                    {album.description || `${album.title} is a stunning album by ${album.artist}, showcasing their unique style and musical vision. The album features ${album.tracks.length} exceptional tracks that take listeners on an unforgettable journey.`}
                  </p>
                  <p>
                    Released on {new Date(album.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}, this collection demonstrates {album.artist}'s growth as an artist and their willingness to explore new sounds.
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Button variant="dark" size="sm" icon={<Share2 size={16} />}>
                      Share
                    </Button>
                    <Button variant="glass" size="sm" icon={<ExternalLink size={16} />}>
                      Artist Page
                    </Button>
                  </div>
                </Card.Content>
              </Card>
            </SlideInLeft>
            
            <SlideInRight>
              <Card variant="dark">
                <Card.Header className="flex items-center gap-3">
                  <img 
                    src={`https://i.pravatar.cc/150?u=${album.artist}`} 
                    alt={album.artist} 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-white font-semibold">{album.artist}</h3>
                    <p className="text-gray-400 text-sm">Artist</p>
                  </div>
                </Card.Header>
                <Card.Content>
                  <p className="text-gray-300 text-sm">
                    {album.artist} is known for their captivating music and compelling performances. They've gained a dedicated following for their unique sound and artistic vision.
                  </p>
                </Card.Content>
                <Card.Footer className="flex justify-end">
                  <Button variant="glass" size="sm">
                    Follow
                  </Button>
                </Card.Footer>
              </Card>
            </SlideInRight>
          </div>
          
          {/* Reviews section */}
          <SlideUp delay={0.4} className="mt-16">
            <Card variant="dark">
              <Card.Header>
                <h2 className="text-white text-xl font-bold">Fan Reviews</h2>
              </Card.Header>
              <Card.Content>
                <ReviewList contentId={id} contentType="album" key={reviewsRefresh} />
              </Card.Content>
              <Card.Footer>
                <h3 className="text-white text-lg font-semibold mb-3">Add Your Review</h3>
                <ReviewForm 
                  contentId={id} 
                  contentType="album" 
                  onReviewSubmitted={handleReviewSubmitted} 
                />
              </Card.Footer>
            </Card>
          </SlideUp>
        </div>
    </div>
    </MainLayout>
  );
};

export default AlbumDetail;
