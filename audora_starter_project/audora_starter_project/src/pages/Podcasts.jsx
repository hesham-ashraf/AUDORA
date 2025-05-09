import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Headphones, Filter, Radio, Tag, Clock, Search, ChevronRight } from 'lucide-react';
import MainLayout from '../layout/MainLayout';
import { FadeIn, StaggerContainer, StaggerItem } from '../components/MotionComponents';
import Button from '../components/ui/Button';
import { podcasts as podcastsData } from '../utils/mockData';

const Podcasts = () => {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [featuredPodcast, setFeaturedPodcast] = useState(null);

  useEffect(() => {
    // Simulate loading from API
    const timer = setTimeout(() => {
      // Set the first podcast as featured
      if (podcastsData && podcastsData.length > 0) {
        setFeaturedPodcast(podcastsData[0]);
      }
      setPodcasts(podcastsData);
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryFilter = (category) => {
    setActiveCategory(category);
  };

  // Filter podcasts based on search term and category
  const filteredPodcasts = podcasts.filter(podcast => {
    const matchesSearch = podcast.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          podcast.host.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || 
                           (podcast.categories && podcast.categories.includes(activeCategory));
    return matchesSearch && matchesCategory;
  });

  // Get all unique categories from podcasts
  const allCategories = podcasts.reduce((cats, podcast) => {
    if (podcast.categories) {
      podcast.categories.forEach(cat => {
        if (!cats.includes(cat)) {
          cats.push(cat);
        }
      });
    }
    return cats;
  }, []);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <FadeIn>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Podcasts</h1>
              <p className="text-gray-400">Discover interesting podcasts from various categories</p>
            </div>
          </div>
        </FadeIn>
        
        {/* Search and Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search podcasts..."
              value={searchTerm}
              onChange={handleSearch}
              className="bg-dark-100 w-full pl-10 pr-4 py-2.5 rounded-lg border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
          </div>
        </div>
        
        {/* Categories */}
        <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex gap-2">
            <Button 
              variant={activeCategory === 'all' ? 'primary' : 'glass'} 
              onClick={() => handleCategoryFilter('all')}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <Radio size={16} />
              <span>All Categories</span>
            </Button>
            
            {allCategories.map(category => (
              <Button 
                key={category}
                variant={activeCategory === category ? 'primary' : 'glass'} 
                onClick={() => handleCategoryFilter(category)}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <Tag size={16} />
                <span>{category}</span>
              </Button>
            ))}
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 rounded-full border-t-2 border-b-2 border-primary-500 animate-spin mb-4"></div>
              <div className="h-4 bg-dark-100 rounded w-32"></div>
            </div>
          </div>
        ) : (
          <>
            {/* Featured Podcast */}
            {featuredPodcast && searchTerm === '' && activeCategory === 'all' && (
              <div className="mb-10">
                <h2 className="text-xl font-semibold text-white mb-4">Featured Podcast</h2>
                <div className="bg-gradient-to-r from-dark-200 to-dark-300 rounded-xl overflow-hidden shadow-lg">
                  <div className="md:flex">
                    <div className="md:w-1/3 relative">
                      <img 
                        src={featuredPodcast.coverUrl} 
                        alt={featuredPodcast.title}
                        className="w-full aspect-square object-cover md:h-full"
                      />
                    </div>
                    <div className="p-6 md:w-2/3 flex flex-col justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">{featuredPodcast.title}</h3>
                        <p className="text-gray-300 mb-4">{featuredPodcast.description || 'Join us for interesting conversations and insights on various topics.'}</p>
                        
                        <div className="flex items-center text-gray-400 mb-6">
                          <Headphones size={16} className="mr-2" />
                          <span className="mr-3">Host: {featuredPodcast.host}</span>
                          <Clock size={16} className="mr-2" />
                          <span>{featuredPodcast.episodes?.length || 0} episodes</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-6">
                          {featuredPodcast.categories?.map(category => (
                            <span key={category} className="bg-primary-500/20 text-primary-300 text-xs px-2 py-1 rounded-full">
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <Link to={`/podcasts/${featuredPodcast.id}`}>
                          <Button variant="primary" className="flex items-center gap-2">
                            <Radio size={16} />
                            <span>View Episodes</span>
                            <ChevronRight size={16} />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {filteredPodcasts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Headphones size={48} className="text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No podcasts found</h3>
                <p className="text-gray-400 mb-4 max-w-md">
                  {searchTerm ? "No podcasts match your search criteria." : "There are no podcasts available in this category."}
                </p>
                <Button 
                  variant="primary" 
                  onClick={() => {
                    setSearchTerm('');
                    setActiveCategory('all');
                  }}
                  className="flex items-center gap-2"
                >
                  <Radio size={16} />
                  <span>Show All Podcasts</span>
                </Button>
              </div>
            ) : (
              <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredPodcasts.map(podcast => (
                  <StaggerItem key={podcast.id}>
                    <Link to={`/podcasts/${podcast.id}`}>
                      <motion.div 
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        className="bg-dark-200/80 rounded-lg overflow-hidden border border-white/5 shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <div className="relative aspect-square overflow-hidden">
                          <img 
                            src={podcast.coverUrl} 
                            alt={podcast.title} 
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-dark-400/90 to-transparent"></div>
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{podcast.title}</h3>
                            <p className="text-gray-300 text-sm line-clamp-1">Host: {podcast.host}</p>
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="text-xs text-gray-400 mb-3">
                            {podcast.episodes?.length || 0} episode{podcast.episodes?.length !== 1 ? 's' : ''}
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {podcast.categories?.slice(0, 3).map(category => (
                              <span key={category} className="inline-block bg-dark-100 rounded-full px-2 py-1 text-xs text-gray-300">
                                {category}
                              </span>
                            ))}
                            {podcast.categories?.length > 3 && (
                              <span className="inline-block bg-dark-100 rounded-full px-2 py-1 text-xs text-gray-300">
                                +{podcast.categories.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Podcasts;