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

// Flashcards API calls
export const flashcardAPI = {
  // Create a flashcard for the current user
  createFlashcard: (data) => api.post('/flashcards', data),

  // Get flashcards for the current user (optional subject filter)
  getFlashcards: (subject) => {
    if (subject && typeof subject === 'string' && subject.trim()) {
      return api.get('/flashcards', { params: { subject } });
    }
    return api.get('/flashcards');
  },

  getFlashcardById: (id) => api.get(`/flashcards/${id}`),

  updateFlashcard: (id, data) => api.put(`/flashcards/${id}`, data),

  deleteFlashcard: (id) => api.delete(`/flashcards/${id}`)
};

// AI Quizzes API calls
export const aiQuizAPI = {
  // Generate a quiz from an uploaded PDF
  generateQuizFromPdf: (formData) =>
    api.post('/ai-quizzes/generate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  // List my saved quizzes
  getMyQuizzes: () => api.get('/ai-quizzes'),

  // Get a saved quiz
  getQuizById: (id) => api.get(`/ai-quizzes/${id}`),

  // Delete a quiz
  deleteQuiz: (id) => api.delete(`/ai-quizzes/${id}`),

  // Submit quiz attempt results (stores correct-answer rate)
  submitQuizAttempt: (quizId, selectedOptions) =>
    api.post(`/ai-quizzes/${quizId}/attempts`, { selectedOptions }),

  // Get analytics based on correct-answer rate
  getQuizAnalytics: () => api.get('/ai-quizzes/analytics')}
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
