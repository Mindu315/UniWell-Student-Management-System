/**
 * AI Quiz Attempt Controller
 * Stores attempt results so we can compute analytics.
 */

const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');

const validateQuizAttemptPayload = (selectedOptions) => {
  if (!Array.isArray(selectedOptions)) return null;
  return selectedOptions.map((n) => {
    if (typeof n !== 'number' || !Number.isFinite(n)) return null;
    return n;
  });
};

const submitQuizAttempt = async (req, res) => {
  try {
    const quizId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const { selectedOptions } = req.body || {};
    const normalized = validateQuizAttemptPayload(selectedOptions);
    if (!normalized) {
      return res.status(400).json({ success: false, message: 'selectedOptions must be an array' });
    }

    const quiz = await Quiz.findOne({ _id: quizId, userId: req.user.id });
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (normalized.length !== quiz.questions.length) {
      return res.status(400).json({
        success: false,
        message: `selectedOptions length must match quiz questions (${quiz.questions.length})`
      });
    }

    const invalid = normalized.some((opt) => opt === null || opt < 0 || opt > 3 || !Number.isInteger(opt));
    if (invalid) {
      return res.status(400).json({ success: false, message: 'Each option must be an integer between 0 and 3' });
    }

    let correctCount = 0;
    for (let i = 0; i < quiz.questions.length; i++) {
      const q = quiz.questions[i];
      if (normalized[i] === q.correctOptionIndex) correctCount++;
    }

    const totalCount = quiz.questions.length;
    const correctRate = totalCount > 0 ? correctCount / totalCount : 0;

    const attempt = await QuizAttempt.create({
      userId: req.user.id,
      quizId: quiz._id,
      selectedOptions: normalized,
      correctCount,
      totalCount,
      correctRate
    });

    res.status(201).json({
      success: true,
      message: 'Quiz attempt submitted successfully',
      data: {
        attemptId: attempt._id,
        correctCount,
        totalCount,
        correctRate
      }
    });
  } catch (error) {
    console.error('Submit quiz attempt error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting attempt',
      error: error.message
    });
  }
};

module.exports = { submitQuizAttempt };

