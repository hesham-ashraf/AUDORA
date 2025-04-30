import React, { useRef, useEffect, useState } from 'react';

const AudioPlayer = ({ currentTrack }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [loop, setLoop] = useState(false);
  const [shuffle, setShuffle] = useState(false);

  useEffect(() => {
    if (audioRef.current && currentTrack?.audioUrl) {
      audioRef.current.pause();
      audioRef.current.load();
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [currentTrack]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    setProgress(audioRef.current.currentTime);
    setDuration(audioRef.current.duration);
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setProgress(newTime);
  };

  const handleVolume = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60) || 0;
    const seconds = Math.floor(time % 60) || 0;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!currentTrack || !currentTrack.audioUrl) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md text-white p-2 flex items-center justify-between z-50 border-t border-neutral-700">
      <div className="flex items-center gap-3 w-[220px]">
        <img src={currentTrack.image} alt="cover" className="w-10 h-10 object-cover rounded-md" />
        <div className="truncate">
          <p className="text-sm font-medium truncate text-white leading-tight">{currentTrack.title}</p>
          <p className="text-xs text-gray-400 truncate">{currentTrack.artist}</p>
        </div>
      </div>

      <div className="flex flex-col items-center w-full max-w-xl">
        <div className="flex gap-4 items-center">
          <button
            onClick={() => setShuffle(!shuffle)}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition border border-gray-600 ${shuffle ? 'bg-green-500 text-white' : 'text-gray-300 hover:text-white'}`}
            title="Shuffle"
          >
            🔀
          </button>

          <button className="w-7 h-7 text-gray-300 hover:text-white" title="Previous">
            ⏮
          </button>

          <button
            onClick={togglePlayPause}
            className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center text-base hover:scale-105 transition"
            title="Play/Pause"
          >
            {isPlaying ? '❚❚' : '▶'}
          </button>

          <button className="w-7 h-7 text-gray-300 hover:text-white" title="Next">
            ⏭
          </button>

          <button
            onClick={() => setLoop(!loop)}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition border border-gray-600 ${loop ? 'bg-green-500 text-white' : 'text-gray-300 hover:text-white'}`}
            title="Loop"
          >
            🔁
          </button>
        </div>
        <div className="flex items-center gap-3 w-full mt-1">
          <span className="text-[10px] text-gray-400">{formatTime(progress)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={progress}
            onChange={handleSeek}
            className="w-full accent-green-500 h-1"
          />
          <span className="text-[10px] text-gray-400">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 w-[180px] justify-end">
        <label className="text-xs">🔊</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolume}
          className="accent-green-500 w-20 h-1"
        />
      </div>

      <audio
        ref={audioRef}
        loop={loop}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      >
        <source src={currentTrack.audioUrl} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default AudioPlayer;
