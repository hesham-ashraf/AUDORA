import React, { createContext, useState, useContext, useEffect } from 'react';
import auth from '../services/auth';

// Create auth context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user on initial render
  useEffect(() => {
    const loadUser = () => {
      const user = auth.getUser();
      setUser(user);
      setLoading(false);
    };
    
    loadUser();
  }, []);

  // Register user
  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const user = await auth.register(name, email, password);
      setUser(user);
      return user;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    setLoading(true);
    try {
      const user = await auth.login(email, password);
      setUser(user);
      return user;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    auth.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        register,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

export default AuthContext; 