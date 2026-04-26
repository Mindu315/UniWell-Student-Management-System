/**
 * Flashcard Controller
 * CRUD operations for study flashcards (protected per-user).
 */

const mongoose = require('mongoose');
const Flashcard = require('../models/Flashcard');

const validateObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const createFlashcard = async (req, res) => {
  try {
    const { subject, question, answer } = req.body;

    if (!subject || !question || !answer) {
      return res.status(400).json({
        success: false,
        message: 'Please provide subject, question, and answer'
      });
    }

    const flashcard = await Flashcard.create({
      userId: req.user.id,
      subject: subject.trim(),
      question: question.trim(),
      answer: answer.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Flashcard created successfully',
      data: { flashcard }
    });
  } catch (error) {
    console.error('Create flashcard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating flashcard',
      error: error.message
    });
  }
};

const getFlashcards = async (req, res) => {
  try {
    const { subject } = req.query;

    const filter = { userId: req.user.id };
    if (subject && typeof subject === 'string' && subject.trim()) {
      // Simple case-insensitive substring search for convenience.
      filter.subject = { $regex: subject.trim(), $options: 'i' };
    }

    const flashcards = await Flashcard.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Flashcards retrieved successfully',
      data: {
        count: flashcards.length,
        flashcards
      }
    });
  } catch (error) {
    console.error('Get flashcards error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving flashcards',
      error: error.message
    });
  }
};

const getFlashcardById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard not found'
      });
    }

    const flashcard = await Flashcard.findOne({
      _id: id,
      userId: req.user.id
    });

    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Flashcard retrieved successfully',
      data: { flashcard }
    });
  } catch (error) {
    console.error('Get flashcard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving flashcard',
      error: error.message
    });
  }
};

const updateFlashcardById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard not found'
      });
    }

    const { subject, question, answer } = req.body;

    if (!subject || !question || !answer) {
      return res.status(400).json({
        success: false,
        message: 'Please provide subject, question, and answer'
      });
    }

    const updatedFlashcard = await Flashcard.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      {
        $set: {
          subject: subject.trim(),
          question: question.trim(),
          answer: answer.trim()
        }
      },
      { new: true }
    );

    if (!updatedFlashcard) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Flashcard updated successfully',
      data: { flashcard: updatedFlashcard }
    });
  } catch (error) {
    console.error('Update flashcard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating flashcard',
      error: error.message
    });
  }
};

const deleteFlashcardById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard not found'
      });
    }

    const flashcard = await Flashcard.findOneAndDelete({
      _id: id,
      userId: req.user.id
    });

    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Flashcard deleted successfully'
    });
  } catch (error) {
    console.error('Delete flashcard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting flashcard',
      error: error.message
    });
  }
};

module.exports = {
  createFlashcard,
  getFlashcards,
  getFlashcardById,
  updateFlashcardById,
  deleteFlashcardById
};

