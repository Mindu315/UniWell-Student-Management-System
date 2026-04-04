const express = require('express');
const router = express.Router();
const careerController = require('../controllers/careerController');

// POST request because we are sending user selection data
router.post('/recommend', careerController.recommendCareer);

module.exports = router;