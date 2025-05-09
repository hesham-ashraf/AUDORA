import React, { useRef, useEffect, useState, useCallback } from 'react';
import offline from '../services/offline';
import { Heart, Download, MoreHorizontal } from 'lucide-react';

const AudioPlayer = ({ currentTrack }) => {
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [previousVolume, setPreviousVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [loop, setLoop] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [isOnline, setIsOnline] = useState(offline.isOnline());
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [isHoveringProgress, setIsHoveringProgress] = useState(false);
  const [previewTime, setPreviewTime] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Setup online/offline listeners
  useEffect(() => {
    const cleanup = offline.setupOfflineListeners(
      () => setIsOnline(true),
      () => setIsOnline(false)
    );
    
    // Persist volume in localStorage
    const savedVolume = localStorage.getItem('audora_volume');
    if (savedVolume) {
      const parsedVolume = parseFloat(savedVolume);
      setVolume(parsedVolume);
      setPreviousVolume(parsedVolume);
      if (audioRef.current) {
        audioRef.current.volume = parsedVolume;
      }
    }

    return cleanup;
  }, []);

  // Handle track changes
  useEffect(() => {
    if (audioRef.current && currentTrack?.audioUrl) {
      setLoadingAudio(true);
      audioRef.current.pause();
      audioRef.current.load();
      
      const playAudio = async () => {
        try {
          setIsPlaying(true);
          await audioRef.current.play();
        } catch (error) {
          console.error('Error playing audio:', error);
          setIsPlaying(false);
        } finally {
          setLoadingAudio(false);
        }
      };
      
      playAudio();
    }
  }, [currentTrack]);

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Space bar to play/pause
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        togglePlayPause();
      }
      
      // M key to mute
      if (e.code === 'KeyM' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        toggleMute();
      }
      
      // Arrow right for +5 seconds
      if (e.code === 'ArrowRight' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        if (!currentTrack?.isLive && audioRef.current) {
          audioRef.current.currentTime = Math.min(audioRef.current.duration, audioRef.current.currentTime + 5);
        }
      }
      
      // Arrow left for -5 seconds
      if (e.code === 'ArrowLeft' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        if (!currentTrack?.isLive && audioRef.current) {
          audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 5);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTrack]);

  const togglePlayPause = () => {
    if (!audioRef.current || !currentTrack?.audioUrl) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
      });
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      audioRef.current.volume = previousVolume;
      setVolume(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      audioRef.current.volume = 0;
      setVolume(0);
      setIsMuted(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setProgress(audioRef.current.currentTime);
    setDuration(audioRef.current.duration);
  };

  const handleProgressMouseMove = useCallback((e) => {
    if (!progressBarRef.current || currentTrack?.isLive) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const previewTimeValue = pos * duration;
    
    setPreviewTime(previewTimeValue);
  }, [duration, currentTrack?.isLive]);

  const handleSeek = (e) => {
    // Disable seeking for live streams
    if (currentTrack?.isLive || !audioRef.current) return;
    
    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setProgress(newTime);
  };

  const handleVolumeChange = (e) => {
    if (!audioRef.current) return;
    
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
    
    // Update localStorage
    localStorage.setItem('audora_volume', newVolume);
    
    // Update muted state
    setIsMuted(newVolume === 0);
    if (newVolume > 0) {
      setPreviousVolume(newVolume);
    }
  };

  const formatTime = (time) => {
    if (!time || isNaN(time) || currentTrack?.isLive) return '--:--';
    const minutes = Math.floor(time / 60) || 0;
    const seconds = Math.floor(time % 60) || 0;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return '🔇';
    if (volume < 0.3) return '🔈';
    if (volume < 0.7) return '🔉';
    return '🔊';
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    
    // Store favorite tracks in localStorage
    if (!currentTrack) return;
    
    try {
      const favorites = JSON.parse(localStorage.getItem('audora_favorites') || '[]');
      
      if (!isFavorite) {
        // Add to favorites
        favorites.push({
          id: currentTrack.id || Date.now(),
          title: currentTrack.title,
          artist: currentTrack.artist,
          image: currentTrack.image,
          audioUrl: currentTrack.audioUrl
        });
        localStorage.setItem('audora_favorites', JSON.stringify(favorites));
      } else {
        // Remove from favorites
        const updatedFavorites = favorites.filter(
          track => track.title !== currentTrack.title || track.artist !== currentTrack.artist
        );
        localStorage.setItem('audora_favorites', JSON.stringify(updatedFavorites));
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  const handleDownload = () => {
    // Check if the audio URL exists
    if (!currentTrack?.audioUrl) return;
    
    // Create an anchor element
    const a = document.createElement('a');
    a.href = currentTrack.audioUrl;
    a.download = `${currentTrack.artist} - ${currentTrack.title}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  // Check if track is in favorites when a new track loads
  useEffect(() => {
    if (!currentTrack) return;
    
    try {
      const favorites = JSON.parse(localStorage.getItem('audora_favorites') || '[]');
      const isCurrentTrackFavorite = favorites.some(
        track => track.title === currentTrack.title && track.artist === currentTrack.artist
      );
      setIsFavorite(isCurrentTrackFavorite);
    } catch (error) {
      console.error('Error checking favorites:', error);
    }
  }, [currentTrack]);

  if (!currentTrack || !currentTrack.audioUrl) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md text-white p-2 flex items-center justify-between z-50 border-t border-neutral-700">
      <div className="flex items-center gap-3 w-[220px]">
        <img src={currentTrack.image} alt="cover" className="w-12 h-12 object-cover rounded-md shadow-lg" />
        <div className="truncate">
          <p className="text-sm font-medium truncate text-white leading-tight">{currentTrack.title}</p>
          <p className="text-xs text-gray-400 truncate">
            {currentTrack.artist} 
            {currentTrack.isLive && (
              <span className="ml-2 text-red-500 animate-pulse">• LIVE</span>
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center w-full max-w-xl">
        <div className="flex gap-4 items-center mb-1">
          <button
            onClick={() => setShuffle(!shuffle)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition ${shuffle ? 'bg-green-500 text-white' : 'text-gray-300 hover:bg-gray-800/40 hover:text-white'}`}
            title="Shuffle"
            disabled={currentTrack.isLive}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M15.97 2.47a.75.75 0 011.06 0l4.5 4.5a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 11-1.06-1.06l3.22-3.22H7.5a.75.75 0 010-1.5h11.69l-3.22-3.22a.75.75 0 010-1.06zm-7.94 9a.75.75 0 010 1.06l-3.22 3.22H16.5a.75.75 0 010 1.5H4.81l3.22 3.22a.75.75 0 11-1.06 1.06l-4.5-4.5a.75.75 0 010-1.06l4.5-4.5a.75.75 0 011.06 0z" clipRule="evenodd" />
            </svg>
          </button>

          <button 
            className="w-8 h-8 text-gray-300 hover:bg-gray-800/40 hover:text-white rounded-full flex items-center justify-center" 
            title="Previous"
            disabled={currentTrack.isLive}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M9.195 18.44c1.25.713 2.805-.19 2.805-1.629v-2.34l6.945 3.968c1.25.714 2.805-.188 2.805-1.628V8.688c0-1.44-1.555-2.342-2.805-1.628L12 11.03v-2.34c0-1.44-1.555-2.343-2.805-1.629l-7.108 4.062c-1.26.72-1.26 2.536 0 3.256l7.108 4.061z" />
            </svg>
          </button>

          <button
            onClick={togglePlayPause}
            disabled={loadingAudio}
            className={`w-10 h-10 bg-white text-black rounded-full flex items-center justify-center text-base hover:scale-105 transition-all ${loadingAudio ? 'opacity-50 cursor-wait' : ''}`}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {loadingAudio ? (
              <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          <button 
            className="w-8 h-8 text-gray-300 hover:bg-gray-800/40 hover:text-white rounded-full flex items-center justify-center" 
            title="Next"
            disabled={currentTrack.isLive}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M5.055 7.06c-1.25-.714-2.805.189-2.805 1.628v8.123c0 1.44 1.555 2.342 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.342 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256L14.805 6.99C13.555 6.278 12 7.18 12 8.621v2.34L5.055 7.06z" />
            </svg>
          </button>

          <button
            onClick={() => setLoop(!loop)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition ${loop ? 'bg-green-500 text-white' : 'text-gray-300 hover:bg-gray-800/40 hover:text-white'}`}
            title="Loop"
            disabled={currentTrack.isLive}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M12 5.25c1.213 0 2.415.046 3.605.135a3.256 3.256 0 013.01 3.01c.044.583.077 1.17.1 1.759L17.03 8.47a.75.75 0 10-1.06 1.06l3 3a.75.75 0 001.06 0l3-3a.75.75 0 00-1.06-1.06l-1.752 1.751c-.023-.65-.06-1.296-.108-1.939a4.756 4.756 0 00-4.392-4.392 49.422 49.422 0 00-7.436 0A4.756 4.756 0 003.89 8.282c-.017.224-.033.447-.046.672a.75.75 0 101.497.092c.013-.217.028-.434.044-.651a3.256 3.256 0 013.01-3.01c1.19-.09 2.392-.135 3.605-.135zm-6.97 6.22a.75.75 0 00-1.06 0l-3 3a.75.75 0 101.06 1.06l1.752-1.751c.023.65.06 1.296.108 1.939a4.756 4.756 0 004.392 4.392 49.413 49.413 0 007.436 0 4.756 4.756 0 004.392-4.392c.017-.223.032-.447.046-.672a.75.75 0 00-1.497-.092c-.013.217-.028.434-.044.651a3.256 3.256 0 01-3.01 3.01 47.953 47.953 0 01-7.21 0 3.256 3.256 0 01-3.01-3.01 47.759 47.759 0 01-.1-1.759L6.97 15.53a.75.75 0 001.06-1.06l-3-3z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div 
          className="flex items-center gap-3 w-full mt-1 relative"
          onMouseEnter={() => setIsHoveringProgress(true)}
          onMouseLeave={() => setIsHoveringProgress(false)}
          onMouseMove={handleProgressMouseMove}
        >
          <span className="text-xs text-gray-400 w-10 text-right">{currentTrack.isLive ? 'LIVE' : formatTime(progress)}</span>
          
          <div className="w-full relative h-3 flex items-center group" ref={progressBarRef}>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={progress}
              onChange={handleSeek}
              className={`w-full h-1 bg-gray-600 appearance-none rounded cursor-pointer ${currentTrack.isLive ? 'opacity-50 cursor-not-allowed' : 'hover:h-2 transition-all'}`}
              disabled={currentTrack.isLive}
              style={{
                background: currentTrack.isLive 
                  ? 'linear-gradient(to right, #f87171, #ef4444)' 
                  : `linear-gradient(to right, #1ed760 ${(progress / duration) * 100}%, #4b5563 ${(progress / duration) * 100}%)`
              }}
            />
            
            {isHoveringProgress && !currentTrack.isLive && (
              <div 
                className="absolute top-0 transform -translate-y-8 px-2 py-1 bg-black/80 text-white text-xs rounded pointer-events-none whitespace-nowrap"
                style={{ 
                  left: `${(previewTime / duration) * 100}%`,
                  transform: `translateX(-50%) translateY(-100%)` 
                }}
              >
                {formatTime(previewTime)}
              </div>
            )}
          </div>
          
          <span className="text-xs text-gray-400 w-10">{currentTrack.isLive ? '' : formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 w-[180px] justify-end">
        {!isOnline && (
          <span className="text-xs text-yellow-400 mr-2 bg-yellow-500/20 px-2 py-0.5 rounded-full">Offline Mode</span>
        )}
        
        <button 
          onClick={toggleFavorite}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            isFavorite ? 'text-red-500 hover:bg-red-500/10' : 'text-gray-300 hover:bg-gray-800/40 hover:text-white'
          }`}
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
        </button>
        
        <button 
          onClick={handleDownload}
          className="w-8 h-8 text-gray-300 hover:bg-gray-800/40 hover:text-white rounded-full flex items-center justify-center"
          title="Download"
          disabled={!currentTrack?.audioUrl}
        >
          <Download size={18} />
        </button>
        
        <div className="relative">
          <button 
            onClick={toggleMenu}
            className="w-8 h-8 text-gray-300 hover:bg-gray-800/40 hover:text-white rounded-full flex items-center justify-center"
            title="More options"
          >
            <MoreHorizontal size={18} />
          </button>
          
          {showMenu && (
            <div className="absolute bottom-full right-0 mb-2 w-48 bg-dark-200 rounded-lg shadow-lg border border-white/10 overflow-hidden z-50">
              <ul className="py-1">
                <li>
                  <button 
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-dark-100 flex items-center gap-2"
                    onClick={() => {
                      window.open(`https://www.google.com/search?q=${encodeURIComponent(`${currentTrack.artist} ${currentTrack.title}`)}`);
                      setShowMenu(false);
                    }}
                  >
                    Search on Google
                  </button>
                </li>
                <li>
                  <button 
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-dark-100 flex items-center gap-2"
                    onClick={() => {
                      const shareText = `Listen to ${currentTrack.title} by ${currentTrack.artist} on Audora`;
                      if (navigator.share) {
                        navigator.share({
                          title: currentTrack.title,
                          text: shareText,
                          url: window.location.href
                        });
                      } else {
                        navigator.clipboard.writeText(shareText + ' - ' + window.location.href);
                        alert('Link copied to clipboard!');
                      }
                      setShowMenu(false);
                    }}
                  >
                    Share
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
        
        <button 
          onClick={toggleMute}
          className="w-8 h-8 text-gray-300 hover:bg-gray-800/40 hover:text-white rounded-full flex items-center justify-center"
        >
          {getVolumeIcon()}
        </button>
        
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="w-24 h-1 bg-gray-600 rounded appearance-none cursor-pointer accent-green-500"
          style={{
            background: `linear-gradient(to right, #1ed760 ${volume * 100}%, #4b5563 ${volume * 100}%)`
          }}
        />
      </div>

      <audio
        ref={audioRef}
        loop={loop}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onLoadedData={() => setLoadingAudio(false)}
        onLoadStart={() => setLoadingAudio(true)}
        preload="auto"
        volume={volume}
      >
        <source src={currentTrack.audioUrl} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default AudioPlayer;
