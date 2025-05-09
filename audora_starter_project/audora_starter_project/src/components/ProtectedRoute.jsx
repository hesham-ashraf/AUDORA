import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!isAuthenticated) {
    // Save the current path to localStorage before redirecting
    localStorage.setItem('redirectPath', location.pathname);
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute; 