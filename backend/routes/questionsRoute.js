// routes/questionRoutes.js
const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// GET questions based on Industry ID
router.get('/:industryId', async (req, res) => {
  try {
    const { industryId } = req.params;
    // Find all questions where the 'industry' field matches the ID
    const questions = await Question.find({ industry: industryId });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;