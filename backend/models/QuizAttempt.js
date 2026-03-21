/**
 * QuizAttempt Model
 * Stores each quiz attempt and computed correct-answer rate for analytics.
 */

const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
      index: true
    },

    // Array of selected option indexes (length should match quiz.questions length)
    selectedOptions: {
      type: [Number],
      required: true,
      validate: {
        validator: function (arr) {
          return Array.isArray(arr);
        },
        message: 'selectedOptions must be an array'
      }
    },

    correctCount: { type: Number, required: true, min: 0 },
    totalCount: { type: Number, required: true, min: 0 },
    correctRate: { type: Number, required: true, min: 0, max: 1 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);

