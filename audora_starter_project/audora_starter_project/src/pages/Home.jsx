import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import MainLayout from '../layout/MainLayout';
import AlbumCard from '../components/AlbumCard';
import api from '../services/api';
import { albums, podcasts, trendingContent, newReleases } from '../utils/mockData';

const Home = ({ setCurrentTrack }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Simulating data loading time
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

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
          <section className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Trending Now</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {trendingContent.map((item) => {
                const isPodcast = 'host' in item;
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
                      onClick={() =>
                        setCurrentTrack({
                          title: item.title,
                          artist: item.artist,
                          image: item.coverUrl,
                          audioUrl: item.tracks?.[0]?.audioUrl || ''
                        })
                      }
                    />
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Top Albums</h2>
              <Link to="/albums" className="text-sm text-blue-600 hover:underline">View All</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {albums.slice(0, 5).map((album) => (
                <Link to={`/albums/${album.id}`} key={album.id}>
                  <AlbumCard
                    title={album.title}
                    artist={album.artist}
                    image={album.coverUrl}
                    onClick={() =>
                      setCurrentTrack({
                        title: album.title,
                        artist: album.artist,
                        image: album.coverUrl,
                        audioUrl: album.tracks?.[0]?.audioUrl || ''
                      })
                    }
                  />
                </Link>
              ))}
            </div>
          </section>

          <section className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Popular Podcasts</h2>
              <Link to="/podcasts" className="text-sm text-blue-600 hover:underline">View All</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {podcasts.slice(0, 5).map((podcast) => (
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

          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Recently Added</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {newReleases.map((item) => {
                const isPodcast = 'host' in item;
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
                      onClick={() =>
                        setCurrentTrack({
                          title: item.title,
                          artist: item.artist,
                          image: item.coverUrl,
                          audioUrl: item.tracks?.[0]?.audioUrl || ''
                        })
                      }
                    />
                  </Link>
                );
              })}
            </div>
          </section>
        </>
      )}
    </MainLayout>
  );
};

export default Home;