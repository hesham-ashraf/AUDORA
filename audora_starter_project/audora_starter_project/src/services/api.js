import axios from 'axios';

// Create axios instance with base URL and default configs
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Change this to your backend URL in production
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status } = error.response;
      
      if (status === 401) {
        // Unauthorized - clear local storage and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      }
      
      if (status === 403) {
        // Forbidden - user doesn't have permission
        console.error('You do not have permission to perform this action');
      }
      
      if (status === 429) {
        // Too many requests - rate limit exceeded
        console.error('Rate limit exceeded. Please try again later.');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network error. Please check your connection and try again.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('An unexpected error occurred:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Debounced request helper to limit API calls (useful for search)
api.debouncedGet = (url, config, delay = 300) => {
  if (api.debounceTimeout) {
    clearTimeout(api.debounceTimeout);
  }
  
  return new Promise((resolve, reject) => {
    api.debounceTimeout = setTimeout(async () => {
      try {
        const response = await api.get(url, config);
        resolve(response);
      } catch (error) {
        reject(error);
      }
    }, delay);
  });
};

export default api;
