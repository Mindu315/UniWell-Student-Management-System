/**
 * Wellbeing Routes
 * Routes for stress management and wellbeing check-ins
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createCheckin,
  getMyCheckins
} = require('../controllers/wellbeingController');

router.post('/check-ins', protect, createCheckin); // POST /api/wellbeing/check-ins
router.get('/check-ins', protect, getMyCheckins); // GET /api/wellbeing/check-ins

module.exports = router;
