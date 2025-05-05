import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import offline from '../services/offline';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn, SlideInLeft } from '../components/MotionComponents';

// Icons
import { 
  Home, Search, Headphones, Radio, PlusSquare, 
  Download, Settings, LogOut, LogIn, UserPlus,
  Menu, X, Music, Heart, Clock, ChevronRight, User
} from 'lucide-react';

const MainLayout = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isOnline = offline.isOnline();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigationItems = [
    { icon: <Home size={20} />, text: 'Home', path: '/' },
    { icon: <Search size={20} />, text: 'Search', path: '/search' },
    { icon: <Headphones size={20} />, text: 'Podcasts', path: '/podcasts' },
    { icon: <Radio size={20} />, text: 'Live', path: '/live-streaming' },
    { icon: <User size={20} />, text: 'Profile', path: '/profile' },
  ];

  const libraryItems = [
    { icon: <Music size={20} />, text: 'Albums', path: '/albums' },
    { icon: <PlusSquare size={20} />, text: 'Playlists', path: '/playlists', requireAuth: true },
    { icon: <Heart size={20} />, text: 'Liked', path: '/liked', requireAuth: true },
    { icon: <Clock size={20} />, text: 'Recently Played', path: '/history', requireAuth: true },
    { icon: <Download size={20} />, text: 'Offline Library', path: '/offline-library', requireAuth: true },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-dark-400 to-dark-300">
      {/* Mobile Header */}
      <header className="lg:hidden bg-dark-300/95 backdrop-blur-md text-white p-4 flex justify-between items-center z-40 sticky top-0 border-b border-white/5">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
        >
          <Menu size={24} />
        </button>
        
        <Link to="/" className="flex items-center gap-2">
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 10 }}
            transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1.5 }}
          >
            <Headphones className="text-primary-500" size={24} />
          </motion.div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary-300 to-primary-500 text-transparent bg-clip-text">
            AUDORA
          </h1>
        </Link>
        
        <div className="flex items-center gap-2">
          {!isOnline && (
            <span className="px-2 py-1 bg-yellow-500 text-black text-xs rounded-full animate-pulse">
              Offline
            </span>
          )}
          {isAuthenticated ? (
            <Link to="/profile">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center"
              >
                <span className="text-sm font-bold">{user?.name?.charAt(0)}</span>
              </motion.div>
            </Link>
          ) : (
            <Link to="/login" className="p-1.5 rounded-full hover:bg-white/10 transition-colors">
              <LogIn size={20} />
            </Link>
          )}
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Desktop */}
        <FadeIn>
          <aside className="hidden lg:flex flex-col w-64 bg-dark-200/95 backdrop-blur-md text-white border-r border-white/5">
            {/* Logo */}
            <div className="p-6 flex items-center gap-2">
              <motion.div
                initial={{ rotate: -10 }}
                animate={{ rotate: 10 }}
                transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1.5 }}
              >
                <Headphones className="text-primary-500" size={24} />
              </motion.div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-300 to-primary-500 text-transparent bg-clip-text">
                AUDORA
              </h1>
            </div>
            
            {/* Main Navigation */}
            <nav className="p-3">
              <p className="text-xs uppercase text-gray-500 font-medium ml-3 mb-2">Menu</p>
              <ul className="space-y-1">
                {navigationItems.map((item) => {
                  if (item.requireAuth && !isAuthenticated) return null;
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                          ${location.pathname === item.path 
                            ? 'bg-primary-600/20 text-primary-400' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                      >
                        {item.icon}
                        <span>{item.text}</span>
                        {location.pathname === item.path && (
                          <motion.div
                            layoutId="nav-indicator"
                            className="w-1 h-6 bg-primary-500 rounded-full absolute right-0"
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            
            {/* Library Section */}
            <nav className="p-3 mt-4">
              <p className="text-xs uppercase text-gray-500 font-medium ml-3 mb-2">Your Library</p>
              <ul className="space-y-1">
                {libraryItems.map((item) => {
                  if (item.requireAuth && !isAuthenticated) return null;
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                          ${location.pathname === item.path 
                            ? 'bg-primary-600/20 text-primary-400' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                      >
                        {item.icon}
                        <span>{item.text}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            
            {/* User Section */}
            <div className="mt-auto p-3 border-t border-white/5">
              {isAuthenticated ? (
                <div>
                  <Link
                    to="/profile"
                    className={`flex items-center justify-between p-3 rounded-lg ${location.pathname === '/profile' 
                      ? 'bg-primary-600/20 text-primary-400' 
                      : 'bg-dark-100/50 backdrop-blur-md hover:bg-dark-100/70 transition-colors'}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                        <span className="text-sm font-bold">{user?.name?.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{user?.name}</p>
                        <p className="text-xs text-gray-400">{user?.email}</p>
                      </div>
                    </div>
                    <User size={18} className="text-gray-400" />
                  </Link>
                  <div className="flex mt-2">
                    <button 
                      onClick={handleLogout}
                      className="w-full p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link 
                    to="/login"
                    className="flex items-center justify-center gap-2 p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <LogIn size={18} />
                    <span>Log in</span>
                  </Link>
                  <Link 
                    to="/register"
                    className="flex items-center justify-center gap-2 p-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                  >
                    <UserPlus size={18} />
                    <span>Sign up</span>
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </FadeIn>
        
        {/* Mobile Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/80 z-50 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              
              <SlideInLeft className="fixed top-0 left-0 h-full w-64 bg-dark-200/95 backdrop-blur-md text-white z-50 lg:hidden flex flex-col">
                <div className="flex justify-between items-center p-5 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Headphones className="text-primary-500" />
                    <h2 className="font-bold">AUDORA</h2>
                  </div>
                  <button 
                    onClick={() => setSidebarOpen(false)}
                    className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  <nav className="p-3">
                    <p className="text-xs uppercase text-gray-500 font-medium ml-3 mb-2">Menu</p>
                    <ul className="space-y-1">
                      {navigationItems.map((item) => {
                        if (item.requireAuth && !isAuthenticated) return null;
                        return (
                          <li key={item.path}>
                            <Link
                              to={item.path}
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                                ${location.pathname === item.path 
                                  ? 'bg-primary-600/20 text-primary-400' 
                                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                              onClick={() => setSidebarOpen(false)}
                            >
                              {item.icon}
                              <span>{item.text}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>
                  
                  {/* Library Section */}
                  <nav className="p-3 mt-4">
                    <p className="text-xs uppercase text-gray-500 font-medium ml-3 mb-2">Your Library</p>
                    <ul className="space-y-1">
                      {libraryItems.map((item) => {
                        if (item.requireAuth && !isAuthenticated) return null;
                        return (
                          <li key={item.path}>
                            <Link
                              to={item.path}
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                                ${location.pathname === item.path 
                                  ? 'bg-primary-600/20 text-primary-400' 
                                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                              onClick={() => setSidebarOpen(false)}
                            >
                              {item.icon}
                              <span>{item.text}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>
                </div>
                
                {/* User Section */}
                <div className="p-3 border-t border-white/5">
                  {isAuthenticated ? (
                    <div>
                      <Link
                        to="/profile"
                        className={`flex items-center justify-between p-3 rounded-lg ${location.pathname === '/profile' 
                          ? 'bg-primary-600/20 text-primary-400' 
                          : 'bg-dark-100/50 backdrop-blur-md hover:bg-dark-100/70 transition-colors'}`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                            <span className="text-sm font-bold">{user?.name?.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{user?.name}</p>
                            <p className="text-xs text-gray-400">{user?.email}</p>
                          </div>
                        </div>
                        <User size={18} className="text-gray-400" />
                      </Link>
                      <div className="flex mt-2">
                        <button 
                          onClick={() => {
                            handleLogout();
                            setSidebarOpen(false);
                          }}
                          className="w-full p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                        >
                          <LogOut size={18} />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Link 
                        to="/login"
                        className="flex items-center justify-center gap-2 p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <LogIn size={18} />
                        <span>Log in</span>
                      </Link>
                      <Link 
                        to="/register"
                        className="flex items-center justify-center gap-2 p-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <UserPlus size={18} />
                        <span>Sign up</span>
                      </Link>
                    </div>
                  )}
                </div>
              </SlideInLeft>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-dark-300 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            key={location.pathname}
            className="min-h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
