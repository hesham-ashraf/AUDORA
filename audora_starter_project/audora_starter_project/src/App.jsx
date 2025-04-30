import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AlbumDetail from "./pages/AlbumDetail"; // ✅ import the page
import Home from './pages/Home';
import Search from './pages/Search'; // <-- create this file if not already
import AudioPlayer from './components/AudioPlayer';
import Podcasts from "./pages/Podcasts";
import PodcastDetail from "./pages/PodcastDetail";
import Playlists from "./pages/Playlists";
import PlaylistDetail from "./pages/PlaylistDetail";
import AdminUpload from './pages/AdminUpload';

function App() {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [trackList, setTrackList] = useState([]);

  return (
    <Router>
      <div className="min-h-screen pb-24">
        <Routes>
          <Route path="/" element={<Home setCurrentTrack={setCurrentTrack} />} />
          <Route path="/search" element={<Search setCurrentTrack={setCurrentTrack} />} />
          <Route path="/albums/:id" element={<AlbumDetail setCurrentTrack={setCurrentTrack} />} /> {/* ✅ add route */}
          <Route path="/podcasts" element={<Podcasts />} />
          <Route path="/podcasts/:id" element={<PodcastDetail setCurrentTrack={setCurrentTrack} />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/playlists/:id" element={<PlaylistDetail setCurrentTrack={setCurrentTrack} />} />
          <Route path="/admin" element={<AdminUpload />} />

        </Routes>
        <AudioPlayer currentTrack={currentTrack} />

        {currentTrack && <AudioPlayer track={currentTrack} />}
      </div>
    </Router>
  );
}

export default App;
