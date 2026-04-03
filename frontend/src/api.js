/**
 * API Configuration and Helper Functions
 * Handles all API calls to the backend
 */

import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5003/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
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

// Auth API calls
export const authAPI = {
  // Register new user
  register: (userData) => api.post('/auth/register', userData),
  
  // Login user
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Get current user
  getMe: () => api.get('/auth/me')
};

// User API calls
export const userAPI = {
  // Update my profile
  updateMyProfile: (data) => api.put('/users/me', data),
  
  // Get all users (admin only)
  getAllUsers: () => api.get('/users'),
  
  // Update user by ID (admin only)
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  
  // Delete user by ID (admin only)
  deleteUser: (id) => api.delete(`/users/${id}`)
};

// Wellbeing API calls
export const wellbeingAPI = {
  // Submit a new wellbeing check-in
  createCheckin: (data) => api.post('/wellbeing/check-ins', data),

  // Get current user's wellbeing check-in history
  getMyCheckins: (limit = 30) => api.get(`/wellbeing/check-ins?limit=${limit}`)
};

// Helper functions for token management
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const removeToken = () => {
  localStorage.removeItem('token');
};

export const getUserFromToken = () => {
  const token = getToken();
  if (!token) return null;
  
  try {
    // Decode JWT token (simple base64 decode)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

export default api;
