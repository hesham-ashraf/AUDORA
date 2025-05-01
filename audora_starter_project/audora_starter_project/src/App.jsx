import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import AlbumDetail from "./pages/AlbumDetail"; // ✅ import the page
import Home from './pages/Home';
import Search from './pages/Search'; // <-- create this file if not already
import AudioPlayer from './components/AudioPlayer';
import Podcasts from "./pages/Podcasts";
import PodcastDetail from "./pages/PodcastDetail";
import Playlists from "./pages/Playlists";
import PlaylistDetail from "./pages/PlaylistDetail";
import AdminUpload from './pages/AdminUpload';
import Login from './pages/Login';
import Register from './pages/Register';
import OfflineLibrary from './pages/OfflineLibrary';
import LiveStreaming from './pages/LiveStreaming';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { PageTransition } from './components/MotionComponents';

// Wrapper component for routes with transitions
const AnimatedRoutes = ({ children, setCurrentTrack }) => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <PageTransition key={location.pathname}>
        <Routes location={location}>
          <Route path="/" element={<Home setCurrentTrack={setCurrentTrack} />} />
          <Route path="/search" element={<Search setCurrentTrack={setCurrentTrack} />} />
          <Route path="/albums/:id" element={<AlbumDetail setCurrentTrack={setCurrentTrack} />} /> {/* ✅ add route */}
          <Route path="/podcasts" element={<Podcasts />} />
          <Route path="/podcasts/:id" element={<PodcastDetail setCurrentTrack={setCurrentTrack} />} />
          <Route 
            path="/playlists" 
            element={
              <ProtectedRoute>
                <Playlists />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/playlists/:id" 
            element={
              <ProtectedRoute>
                <PlaylistDetail setCurrentTrack={setCurrentTrack} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/offline-library" 
            element={
              <ProtectedRoute>
                <OfflineLibrary setCurrentTrack={setCurrentTrack} />
              </ProtectedRoute>
            } 
          />
          <Route path="/live-streaming" element={<LiveStreaming setCurrentTrack={setCurrentTrack} />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminUpload />
              </ProtectedRoute>
            } 
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </PageTransition>
    </AnimatePresence>
  );
};

function App() {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [trackList, setTrackList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulating app initialization 
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-dark-300">
        <div className="flex flex-col items-center">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 rounded-full border-t-2 border-primary-500 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-primary-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-300 to-primary-500 text-transparent bg-clip-text">
            AUDORA
          </h1>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="min-h-screen relative">
            <AnimatedRoutes setCurrentTrack={setCurrentTrack} />
            <AudioPlayer currentTrack={currentTrack} />
            <Toaster
              position="top-center"
              toastOptions={{
                style: { 
                  background: 'rgba(23, 23, 23, 0.9)',
                  color: '#fff',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
