import api from './api';

// Local storage keys
const TOKEN_KEY = 'audora_token';
const USER_KEY = 'audora_user';

// Get token from local storage
const getToken = () => localStorage.getItem(TOKEN_KEY);

// Save token and user to local storage
const setToken = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// Remove token and user from local storage
const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// Get user from local storage
const getUser = () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

// Register user
const register = async (name, email, password) => {
  try {
    const response = await api.post('/auth/register', {
      name,
      email,
      password
    });
    
    const { token, user } = response.data;
    setToken(token, user);
    return user;
  } catch (error) {
    throw error.response?.data?.message || 'Registration failed';
  }
};

// Login user
const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', {
      email,
      password
    });
    
    const { token, user } = response.data;
    setToken(token, user);
    return user;
  } catch (error) {
    throw error.response?.data?.message || 'Login failed';
  }
};

// Logout user
const logout = () => {
  removeToken();
};

// Check if user is authenticated
const isAuthenticated = () => !!getToken();

// Add token to API request headers
const setupAuthHeader = () => {
  const token = getToken();
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Setup auth header on initial load
setupAuthHeader();

const auth = {
  register,
  login,
  logout,
  getToken,
  getUser,
  isAuthenticated,
  setupAuthHeader
};

export default auth; 