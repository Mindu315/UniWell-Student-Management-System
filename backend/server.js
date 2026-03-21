/**
 * SLIIT Stress Management System - Backend Server
 * Simple User Management System
 * 
 * Student: [Your Name]
 * ID: [Your Student ID]
 * 
 * HOW TO RUN:
 * 1. Install dependencies: npm install
 * 2. Create .env file (copy from .env.example)
 * 3. Make sure MongoDB is running
 * 4. Run development server: npm run dev
 * 5. Or run production: npm start
 * 
 * API ENDPOINTS:
 * 
 * Auth Routes:
 * - POST /api/auth/register  - Register new user
 * - POST /api/auth/login     - Login user
 * - GET  /api/auth/me        - Get current user (Protected)
 * 
 * User Routes:
 * - PUT    /api/users/me     - Update my profile (Protected)
 * - GET    /api/users        - Get all users (Admin only)
 * - PUT    /api/users/:id    - Update user (Admin only)
 * - DELETE /api/users/:id    - Delete user (Admin only)
 */

// Load environment variables from .env file
require('dotenv').config();

// Import required packages
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const flashcardRoutes = require('./routes/flashcardRoutes');
const aiQuizRoutes = require('./routes/aiQuizRoutes');

// Create Express app
const app = express();

// Connect to MongoDB database
connectDB();

// Middleware
app.use(express.json()); // Parse JSON request body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

// Enable CORS for React frontend
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from React app
  credentials: true
}));

// Routes
app.use('/api/auth', authRoutes); // Auth routes (register, login, me)
app.use('/api/users', userRoutes); // User routes (profile, admin operations)
app.use('/api/flashcards', flashcardRoutes); // Flashcard CRUD routes (protected)
app.use('/api/ai-quizzes', aiQuizRoutes); // AI quiz generator routes (protected)

// Welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to SLIIT Stress Management System API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me (Protected)'
      },
      users: {
        updateMe: 'PUT /api/users/me (Protected)',
        getAllUsers: 'GET /api/users (Admin)',
        updateUser: 'PUT /api/users/:id (Admin)',
        deleteUser: 'DELETE /api/users/:id (Admin)'
      },
      flashcards: {
        create: 'POST /api/flashcards (Protected)',
        list: 'GET /api/flashcards (Protected)',
        getById: 'GET /api/flashcards/:id (Protected)',
        update: 'PUT /api/flashcards/:id (Protected)',
        remove: 'DELETE /api/flashcards/:id (Protected)'
      },
      aiQuizzes: {
        generate: 'POST /api/ai-quizzes/generate (Protected, multipart/form-data: pdf)',
        list: 'GET /api/ai-quizzes (Protected)',
        getById: 'GET /api/ai-quizzes/:id (Protected)',
        remove: 'DELETE /api/ai-quizzes/:id (Protected)',
        attempts: 'POST /api/ai-quizzes/:id/attempts (Protected, body: { selectedOptions: number[] })',
        analytics: 'GET /api/ai-quizzes/analytics (Protected)'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: err.message
  });
});

// Start server
const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

/**
 * TESTING WITH POSTMAN/THUNDER CLIENT:
 * 
 * 1. Register a user:
 *    POST http://localhost:5000/api/auth/register
 *    Body (JSON):
 *    {
 *      "fullName": "John Doe",
 *      "email": "john@sliit.lk",
 *      "password": "password123",
 *      "studentId": "IT21234567",
 *      "faculty": "Computing",
 *      "degreeProgram": "BSc (Hons) in IT",
 *      "year": 2
 *    }
 * 
 * 2. Login:
 *    POST http://localhost:5000/api/auth/login
 *    Body (JSON):
 *    {
 *      "email": "john@sliit.lk",
 *      "password": "password123"
 *    }
 *    Response will include token - copy it!
 * 
 * 3. Get current user (Protected):
 *    GET http://localhost:5000/api/auth/me
 *    Headers:
 *    Authorization: Bearer <your_token_here>
 * 
 * 4. Update my profile:
 *    PUT http://localhost:5000/api/users/me
 *    Headers:
 *    Authorization: Bearer <your_token_here>
 *    Body (JSON):
 *    {
 *      "fullName": "John Updated",
 *      "year": 3
 *    }
 * 
 * 5. Get all users (Admin only):
 *    GET http://localhost:5000/api/users
 *    Headers:
 *    Authorization: Bearer <admin_token_here>
 * 
 * Note: To test admin routes, manually change a user's role to "admin" in MongoDB
 */
