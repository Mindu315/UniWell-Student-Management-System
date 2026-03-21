/**
 * Flashcard Routes
 * Protected routes for CRUD operations.
 */

const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const {
  createFlashcard,
  getFlashcards,
  getFlashcardById,
  updateFlashcardById,
  deleteFlashcardById
} = require('../controllers/flashcardController');

// All flashcard routes are protected.
router.use(protect);

router.post('/', createFlashcard); // POST /api/flashcards
router.get('/', getFlashcards); // GET /api/flashcards
router.get('/:id', getFlashcardById); // GET /api/flashcards/:id
router.put('/:id', updateFlashcardById); // PUT /api/flashcards/:id
router.delete('/:id', deleteFlashcardById); // DELETE /api/flashcards/:id

module.exports = router;

