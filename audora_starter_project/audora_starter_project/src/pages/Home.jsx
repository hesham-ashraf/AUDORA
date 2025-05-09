import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import MainLayout from '../layout/MainLayout';
import AlbumCard from '../components/AlbumCard';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { albums, podcasts, trendingContent, newReleases } from '../utils/mockData';

const Home = ({ setCurrentTrack }) => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [homeContent, setHomeContent] = useState({
    trending: [],
    newReleases: [],
    popularPodcasts: [],
    recommendedForYou: [],
    moreLikeRecentlyPlayed: [],
    popularWithSimilarListeners: []
  });

  // Fetch content from API or fallback to mock data
  useEffect(() => {
    const fetchHomeContent = async () => {
      try {
        // Try to fetch from API with optional user ID for personalization
        let response;
        if (isAuthenticated && user?.id) {
          response = await api.get(`/home?userId=${user.id}`);
        } else {
          response = await api.get('/home');
        }
        
        setHomeContent(response.data);
        setLoading(false);
      } catch (err) {
        console.warn('Error fetching from API, using mock data:', err);
        
        // Fallback to mock data
        setHomeContent({
          trending: trendingContent,
          newReleases: newReleases,
          popularPodcasts: podcasts.slice(0, 5),
          // Mock personalized sections if user is logged in
          ...(isAuthenticated && {
            recommendedForYou: albums.slice(0, 5),
            moreLikeRecentlyPlayed: albums.slice(5, 10),
            popularWithSimilarListeners: albums.slice(10, 15)
          })
        });
        setLoading(false);
      }
    };
    
    fetchHomeContent();
  }, [isAuthenticated, user]);

  // Record interaction when a user plays a track
  const recordInteraction = async (item, interactionType) => {
    if (!isAuthenticated || !user?.id) return;
    
    try {
      await api.post('/home/interaction', {
        userId: user.id,
        itemId: item.id,
        itemType: item.artist ? 'album' : 'podcast',
        interactionType
      });
    } catch (err) {
      console.error('Failed to record interaction:', err);
    }
  };

  const handlePlayTrack = (item) => {
    setCurrentTrack({
      title: item.title,
      artist: item.artist,
      image: item.coverUrl,
      audioUrl: item.tracks?.[0]?.audioUrl || ''
    });
    
    // Record this interaction
    recordInteraction(item, 'play');
  };

  return (
    <MainLayout>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading content...</p>
        </div>
      ) : error ? (
        <div className="text-red-500 p-4 border border-red-300 rounded-md bg-red-50">
          {error}
        </div>
      ) : (
        <>
          {/* Trending Now Section */}
          <section className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Trending Now</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {homeContent.trending.map((item) => {
                const isPodcast = 'host' in item || item.episodes;
                return isPodcast ? (
                  <Link to={`/podcasts/${item.id}`} key={`trending-podcast-${item.id}`} className="group">
                    <div className="bg-dark-200 rounded-lg shadow hover:shadow-md transition-all duration-200 overflow-hidden border border-white/10">
                      <div className="aspect-square overflow-hidden">
                        <img 
                          src={item.coverUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-3">
                        <div className="flex items-center text-xs text-blue-600 mb-1">
                          <span className="mr-1">🎙️</span>
                          <span>Podcast</span>
                        </div>
                        <h3 className="font-semibold text-lg truncate text-white">{item.title}</h3>
                        <p className="text-sm text-gray-400 truncate">Host: {item.host}</p>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <Link to={`/albums/${item.id}`} key={`trending-album-${item.id}`}>
                    <AlbumCard
                      title={item.title}
                      artist={item.artist}
                      image={item.coverUrl}
                      onClick={() => handlePlayTrack(item)}
                    />
                  </Link>
                );
              })}
            </div>
          </section>

          {/* If user is authenticated, show personalized recommendations */}
          {isAuthenticated && homeContent.recommendedForYou?.length > 0 && (
            <section className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Recommended For You</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {homeContent.recommendedForYou.slice(0, 5).map((album) => (
                  <Link to={`/albums/${album.id}`} key={`rec-${album.id}`}>
                    <AlbumCard
                      title={album.title}
                      artist={album.artist}
                      image={album.coverUrl}
                      onClick={() => handlePlayTrack(album)}
                    />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Top Albums */}
          <section className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Top Albums</h2>
              <Link to="/albums" className="text-sm text-blue-600 hover:underline">View All</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {(homeContent.topAlbums || albums.slice(0, 5)).map((album) => (
                <Link to={`/albums/${album.id}`} key={album.id}>
                  <AlbumCard
                    title={album.title}
                    artist={album.artist}
                    image={album.coverUrl}
                    onClick={() => handlePlayTrack(album)}
                  />
                </Link>
              ))}
            </div>
          </section>

          {/* Popular Podcasts */}
          <section className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Popular Podcasts</h2>
              <Link to="/podcasts" className="text-sm text-blue-600 hover:underline">View All</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {homeContent.popularPodcasts.slice(0, 5).map((podcast) => (
                <Link to={`/podcasts/${podcast.id}`} key={podcast.id} className="group">
                  <div className="bg-dark-200 rounded-lg shadow hover:shadow-md transition-all duration-200 overflow-hidden border border-white/10">
                    <div className="aspect-square overflow-hidden">
                      <img 
                        src={podcast.coverUrl} 
                        alt={podcast.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3">
                      <div className="flex items-center text-xs text-blue-600 mb-1">
                        <span className="mr-1">🎙️</span>
                        <span>Podcast</span>
                      </div>
                      <h3 className="font-semibold text-lg truncate text-white">{podcast.title}</h3>
                      <p className="text-sm text-gray-400 truncate">Host: {podcast.host}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {podcast.episodes?.length || 0} episode{podcast.episodes?.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Recently Added / New Releases */}
          <section className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Recently Added</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {homeContent.newReleases.map((item) => {
                const isPodcast = 'host' in item || item.episodes;
                return isPodcast ? (
                  <Link to={`/podcasts/${item.id}`} key={`new-podcast-${item.id}`} className="group">
                    <div className="bg-dark-200 rounded-lg shadow hover:shadow-md transition-all duration-200 overflow-hidden border border-white/10">
                      <div className="aspect-square overflow-hidden">
                        <img 
                          src={item.coverUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-3">
                        <div className="flex items-center text-xs text-blue-600 mb-1">
                          <span className="mr-1">🎙️</span>
                          <span>Podcast</span>
                        </div>
                        <h3 className="font-semibold text-lg truncate text-white">{item.title}</h3>
                        <p className="text-sm text-gray-400 truncate">Host: {item.host}</p>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <Link to={`/albums/${item.id}`} key={`new-album-${item.id}`}>
                    <AlbumCard
                      title={item.title}
                      artist={item.artist}
                      image={item.coverUrl}
                      onClick={() => handlePlayTrack(item)}
                    />
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Popular With Similar Listeners (only if authenticated and content available) */}
          {isAuthenticated && homeContent.popularWithSimilarListeners?.length > 0 && (
            <section className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Popular With Similar Listeners</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {homeContent.popularWithSimilarListeners.slice(0, 5).map((item) => (
                  <Link to={`/albums/${item.album.id}`} key={`similar-${item.id}`}>
                    <AlbumCard
                      title={item.title}
                      artist={item.album.artist.name}
                      image={item.album.coverUrl}
                      onClick={() => handlePlayTrack({
                        id: item.id,
                        title: item.title,
                        artist: item.album.artist.name,
                        coverUrl: item.album.coverUrl,
                        tracks: [{ audioUrl: item.audioUrl }]
                      })}
                    />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </MainLayout>
  );
};

export default Home;