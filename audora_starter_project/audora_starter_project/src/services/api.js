import axios from 'axios';
import { toast } from 'sonner';

// Create axios instance with base URL and default configs
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('audora_token');
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
      const { status, data } = error.response;
      
      if (status === 401) {
        // Unauthorized - clear local storage and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('audora_token');
        localStorage.removeItem('user');
        localStorage.removeItem('audora_user');
        
        // Save current path for redirect after login
        localStorage.setItem('redirectPath', window.location.pathname);
        
        // Show toast notification
        toast.error('Session expired. Please login again.');
        
        // Redirect to login page
        window.location.href = '/login';
        return Promise.reject(new Error('Authentication required'));
      }
      
      if (status === 403) {
        // Forbidden - user doesn't have permission
        toast.error('You do not have permission to perform this action');
      }
      
      if (status === 429) {
        // Too many requests - rate limit exceeded
        toast.error('Rate limit exceeded. Please try again later.');
      }
      
      // Extract the error message from the response data
      const errorMessage = data?.message || data?.error || 'An error occurred';
      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      // The request was made but no response was received
      toast.error('Network error. Please check your connection and try again.');
      return Promise.reject(new Error('Network error. Please check your connection.'));
    } else {
      // Something happened in setting up the request that triggered an Error
      toast.error('An unexpected error occurred.');
      return Promise.reject(error);
    }
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

// Health check function
api.checkHealth = async () => {
  try {
    const baseUrl = api.defaults.baseURL.replace('/api', '');
    const response = await axios.get(`${baseUrl}/health`, { timeout: 5000 });
    return response.data.status === 'ok';
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
};

export default api;
