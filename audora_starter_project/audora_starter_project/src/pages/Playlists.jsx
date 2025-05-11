import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ListMusic, Plus, Music, PlaySquare, Clock, User, Search } from 'lucide-react';
import MainLayout from '../layout/MainLayout';
import { FadeIn, StaggerContainer, StaggerItem } from '../components/MotionComponents';
import Button from '../components/ui/Button';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('recent');
  const [title, setTitle] = useState('');
  const [trackIds, setTrackIds] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = () => {
    setLoading(true);
    axios.get('http://localhost:5000/api/playlists')
      .then(res => {
        setPlaylists(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (order) => {
    setSortOrder(order);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const userId = user?.id;
    if (!userId) {
      setError('You must be logged in to create a playlist.');
      return;
    }
    if (!newTitle.trim()) return;
    try {
      await axios.post('http://localhost:5000/api/playlists', {
        title: newTitle,
        userId,
        trackIds: []
      });
      setNewTitle('');
      setShowForm(false);
      fetchPlaylists();
      setError('');
    } catch (err) {
      let msg = 'Failed to create playlist';
      if (err.response && err.response.data && err.response.data.error) {
        msg += ': ' + err.response.data.error;
      }
      setError(msg);
    }
  };

  const filteredAndSortedPlaylists = playlists
    .filter((playlist) =>
      playlist.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      playlist.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      playlist.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === 'recent') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortOrder === 'tracks') {
        return b.tracks.length - a.tracks.length;
      } else if (sortOrder === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <FadeIn>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Playlists</h1>
              <p className="text-gray-400">Discover curated music collections from our community</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button variant="primary" className="flex items-center gap-2" onClick={() => setShowForm(!showForm)}>
                <Plus size={16} />
                <span>Create Playlist</span>
              </Button>
            </div>
          </div>
        </FadeIn>

        {showForm && (
          <form onSubmit={handleCreate} className="mb-6 flex gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Playlist Title"
              className="border px-2 py-1 rounded text-black"
              required
            />
            <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded">Create</button>
          </form>
        )}

        {error && <p className="text-red-500">{error}</p>}

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search playlists..."
              value={searchTerm}
              onChange={handleSearch}
              className="bg-dark-100 w-full pl-10 pr-4 py-2.5 rounded-lg border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={sortOrder === 'recent' ? 'primary' : 'glass'}
              onClick={() => handleSort('recent')}
              className="flex items-center gap-2"
            >
              <Clock size={16} />
              <span>Recent</span>
            </Button>
            <Button
              variant={sortOrder === 'tracks' ? 'primary' : 'glass'}
              onClick={() => handleSort('tracks')}
              className="flex items-center gap-2"
            >
              <Music size={16} />
              <span>Tracks</span>
            </Button>
            <Button
              variant={sortOrder === 'alphabetical' ? 'primary' : 'glass'}
              onClick={() => handleSort('alphabetical')}
              className="flex items-center gap-2"
            >
              <ListMusic size={16} />
              <span>A-Z</span>
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
        ) : filteredAndSortedPlaylists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ListMusic size={48} className="text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No playlists found</h3>
            <p className="text-gray-400 mb-4 max-w-md">
              {searchTerm ? 'No playlists match your search criteria.' : 'There are no playlists available yet.'}
            </p>
            <Button variant="primary" className="flex items-center gap-2">
              <Plus size={16} />
              <span>Create Your First Playlist</span>
            </Button>
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedPlaylists.map((playlist) => (
              <StaggerItem key={playlist.id}>
                <Link to={`/playlists/${playlist.id}`}>
                  <motion.div
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="bg-dark-200/80 rounded-lg overflow-hidden border border-white/5 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={playlist.coverUrl}
                        alt={playlist.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-400/90 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex justify-between items-center mb-1">
                          <h3 className="text-xl font-bold text-white truncate mr-2">{playlist.title}</h3>
                          {!playlist.isPublic && (
                            <span className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-full">Private</span>
                          )}
                        </div>
                        <p className="text-gray-300 text-sm line-clamp-2 mb-3">{playlist.description}</p>

                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center text-gray-400">
                            <PlaySquare size={14} className="mr-1" />
                            <span>{playlist.tracks.length} tracks</span>
                          </div>
                          <div className="flex items-center text-gray-400">
                            <Clock size={14} className="mr-1" />
                            <span>{formatDate(playlist.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border-t border-white/5">
                      <div className="flex items-center">
                        <img
                          src={playlist.user.avatar}
                          alt={playlist.user.name}
                          className="w-8 h-8 rounded-full mr-2 border border-white/10"
                        />
                        <div className="text-sm">
                          <span className="text-gray-400">Created by</span>
                          <div className="text-white font-medium">{playlist.user.name}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </MainLayout>
  );
};

export default Playlists;
