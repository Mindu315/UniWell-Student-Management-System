/**
 * AI Quiz Routes
 * Protected endpoints for generating and managing quizzes.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');

const { protect } = require('../middleware/authMiddleware');
const {
  generateQuizFromPdf,
  getMyQuizzes,
  getQuizById,
  deleteQuizById
} = require('../controllers/aiQuizController');
const { submitQuizAttempt } = require('../controllers/aiQuizAttemptController');
const { getAnalytics } = require('../controllers/aiQuizAnalyticsController');

// Store PDF in memory so we can parse it directly.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    // 5 MB default - adjust if needed
    fileSize: 5 * 1024 * 1024
  }
});

// Generate a new quiz from an uploaded PDF
router.post('/generate', protect, upload.single('pdf'), generateQuizFromPdf);

// List your saved quizzes
router.get('/', protect, getMyQuizzes);

// Quiz analytics for current user
router.get('/analytics', protect, getAnalytics);

// Get a specific quiz
router.get('/:id', protect, getQuizById);

// Delete a quiz
router.delete('/:id', protect, deleteQuizById);

// Submit a quiz attempt (stores correct-answer rate)
router.post('/:id/attempts', protect, submitQuizAttempt);

module.exports = router;

