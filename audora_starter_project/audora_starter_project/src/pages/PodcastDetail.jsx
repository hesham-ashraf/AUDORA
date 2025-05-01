import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import axios from 'axios';
import { podcasts } from '../utils/mockData';

const PodcastDetail = ({ setCurrentTrack }) => {
  const { id } = useParams();
  const [podcast, setPodcast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeEpisode, setActiveEpisode] = useState(null);

  useEffect(() => {
    // Find podcast from mock data
    const timer = setTimeout(() => {
      const foundPodcast = podcasts.find(p => p.id === parseInt(id));
      setPodcast(foundPodcast || null);
      setLoading(false);
      if (foundPodcast && foundPodcast.episodes && foundPodcast.episodes.length > 0) {
        setActiveEpisode(foundPodcast.episodes[0]);
      }
    }, 800);
    
    return () => clearTimeout(timer);
  }, [id]);

  const playEpisode = (episode) => {
    setActiveEpisode(episode);
    setCurrentTrack({
      title: episode.title,
      artist: podcast.host,
      image: podcast.coverUrl,
      audioUrl: episode.audioUrl
    });
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading podcast...</p>
        </div>
      </MainLayout>
    );
  }

  if (!podcast) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Podcast Not Found</h2>
          <p className="text-gray-600">The podcast you're looking for doesn't exist or has been removed.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="sticky top-20">
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <img src={podcast.coverUrl} alt={podcast.title} className="w-full aspect-square object-cover" />
              <div className="p-4">
                <h2 className="text-2xl font-bold">{podcast.title}</h2>
                <p className="text-gray-600 mt-1">Host: {podcast.host}</p>
                <p className="text-gray-500 text-sm mt-3">{podcast.episodes.length} episodes</p>
                
                <button 
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-full flex items-center justify-center gap-2"
                  onClick={() => {
                    if (activeEpisode) {
                      playEpisode(activeEpisode);
                    } else if (podcast.episodes && podcast.episodes.length > 0) {
                      playEpisode(podcast.episodes[0]);
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                  </svg>
                  Play Latest Episode
                </button>
              </div>
            </div>
            
            <div className="mt-6 bg-white rounded-lg p-4 shadow-md">
              <h3 className="text-lg font-semibold mb-2">About this podcast</h3>
              <p className="text-gray-600">
                {podcast.description || `Join ${podcast.host} as they explore fascinating topics and interview interesting guests in this engaging podcast series.`}
              </p>
              
              <div className="mt-4">
                <h4 className="font-semibold text-sm text-gray-700">Categories</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {generateRandomCategories().map(category => (
                    <span key={category} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <h3 className="text-xl font-semibold mb-4">All Episodes</h3>
          <div className="space-y-4">
            {podcast.episodes.map((episode, index) => (
              <div 
                key={episode.id}
                className={`bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition ${activeEpisode?.id === episode.id ? 'border-blue-500' : 'border-gray-200'}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{episode.title}</h4>
                    <p className="text-gray-500 text-sm mt-1">Episode {index + 1} • {formatDuration(episode.duration)}</p>
                    <p className="text-gray-600 mt-3">
                      {generateRandomEpisodeDescription(episode.title, podcast.host)}
                    </p>
                    
                    <div className="mt-4 flex items-center gap-3">
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-4 rounded-full flex items-center justify-center gap-1.5 text-sm"
                        onClick={() => playEpisode(episode)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                        </svg>
                        Play
                      </button>
                      
                      <button className="text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                      </button>
                      
                      <button className="text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="hidden md:block">
                    <img 
                      src={podcast.coverUrl} 
                      alt={podcast.title} 
                      className="w-20 h-20 object-cover rounded"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

// Helper function to generate random categories
function generateRandomCategories() {
  const categories = [
    'Technology', 'Health & Wellness', 'Business', 'Science', 'True Crime', 
    'Comedy', 'News', 'Education', 'Finance', 'Travel', 'Music',
    'Self-Improvement', 'History', 'Politics', 'Entertainment'
  ];
  
  const shuffled = [...categories].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3); // Return 3 random categories
}

// Helper function to generate random episode descriptions
function generateRandomEpisodeDescription(title, host) {
  const descriptions = [
    `In this episode, ${host} discusses ${title.toLowerCase()} with industry experts.`,
    `Join ${host} for an in-depth exploration of ${title.toLowerCase()}.`,
    `${host} answers common questions about ${title.toLowerCase()} and shares practical advice.`,
    `Discover the latest trends and insights about ${title.toLowerCase()} in this episode.`,
    `${host} interviews special guests to unpack everything about ${title.toLowerCase()}.`
  ];
  
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

export default PodcastDetail;