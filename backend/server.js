// Load environment variables from .env file
require('dotenv').config();

// Import required packages
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { connectCareerDB } = require('./config/careerDb');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const flashcardRoutes = require('./routes/flashcardRoutes');
const aiQuizRoutes = require('./routes/aiQuizRoutes');
const wellbeingRoutes = require('./routes/wellbeingRoutes');
const careerRoutes = require('./routes/careerRoutes');

// Create Express app
const app = express();

// Connect to MongoDB databases
connectDB();
connectCareerDB().catch((error) => {
  console.error(`❌ Career MongoDB Connection Error: ${error.message}`);
  process.exit(1);
});

// Middleware
app.use(express.json()); // Parse JSON request body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

// Enable CORS for React frontend
// Enable CORS for React frontend
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Allow requests from live frontend OR local
    credentials: true
}));

// Routes
app.use('/api/auth', authRoutes); // Auth routes (register, login, me)
app.use('/api/users', userRoutes); // User routes (profile, admin operations)
app.use('/api/flashcards', flashcardRoutes); // Flashcard CRUD routes (protected)
app.use('/api/ai-quizzes', aiQuizRoutes); // AI quiz generator routes (protected)
app.use('/api/wellbeing', wellbeingRoutes); // Wellbeing routes (check-ins)
app.use('/api/careers', careerRoutes); // Career guidance routes (protected)

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
      },
      wellbeing: {
        createCheckIn: 'POST /api/wellbeing/check-ins (Protected)',
        getCheckIns: 'GET /api/wellbeing/check-ins (Protected)'
      },
      careers: {
        industries: 'GET /api/careers/industries (Protected)',
        skills: 'GET /api/careers/industries/:industryId/skills (Protected)',
        quiz: 'GET /api/careers/industries/:industryId/quiz (Protected)',
        recommend: 'POST /api/careers/recommend (Protected)'
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
