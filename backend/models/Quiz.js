/**
 * Quiz Model
 * Stores AI-generated MCQ quizzes per user.
 */

const mongoose = require('mongoose');

const mcqQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: function (arr) {
          return Array.isArray(arr) && arr.length === 4;
        },
        message: 'Each question must have exactly 4 options'
      }
    },
    // 0-3 index into `options`
    correctOptionIndex: { type: Number, required: true, min: 0, max: 3 },
    explanation: { type: String, required: false, trim: true }
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  quizTitle: { type: String, required: true, trim: true, default: 'Generated Quiz' },
  subject: { type: String, required: false, trim: true, default: '' },
  difficulty: { type: String, required: false, trim: true, default: 'medium' },

  sourcePdfFileName: { type: String, required: false, trim: true, default: '' },
  extractedTextPreview: { type: String, required: false, trim: true, default: '' },

  questionCount: { type: Number, required: true },
  questions: { type: [mcqQuestionSchema], required: true },

  ai: {
    provider: { type: String, required: false, trim: true, default: '' },
    model: { type: String, required: false, trim: true, default: '' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);

