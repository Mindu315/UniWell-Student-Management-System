/**
 * User Routes
 * Routes for user profile updates and admin user management
 */

const express = require('express');
const router = express.Router();
const {
  updateMe,
  getMySettings,
  updateMySettings,
  getAllUsers,
  updateUserById,
  deleteUserById
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// Protected routes (user must be logged in)
router.put('/me', protect, updateMe);  // PUT /api/users/me
router.get('/settings', protect, getMySettings);
router.put('/settings', protect, updateMySettings);

// Admin only routes
router.get('/', protect, admin, getAllUsers);           // GET /api/users
router.put('/:id', protect, admin, updateUserById);     // PUT /api/users/:id
router.delete('/:id', protect, admin, deleteUserById);  // DELETE /api/users/:id

module.exports = router;
