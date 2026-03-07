/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */

import { Navigate } from 'react-router-dom';
import { getToken, getUserFromToken } from '../api';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = getToken();
  
  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // If admin only route, check user role
  if (adminOnly) {
    const user = getUserFromToken();
    if (!user || user.role !== 'admin') {
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  return children;
};

export default ProtectedRoute;
