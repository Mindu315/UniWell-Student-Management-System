/**
 * Authentication Routes
 * Routes for user registration, login, and getting current user
 */

const express = require('express');
const router = express.Router();
const { register, login, me } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);  // POST /api/auth/register
router.post('/login', login);        // POST /api/auth/login

// Protected routes
router.get('/me', protect, me);      // GET /api/auth/me

module.exports = router;
