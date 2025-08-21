// src/routes/PublicRoute.jsx

import { Navigate } from 'react-router-dom';
import authService from '@/services/authService';

const PublicRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

export default PublicRoute;