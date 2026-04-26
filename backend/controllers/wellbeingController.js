/**
 * Wellbeing Controller
 * Handles daily wellbeing check-ins and history retrieval
 */

const WellbeingCheckin = require('../models/WellbeingCheckin');

const calculateScore = ({ energy, sleep, focus, stress }) => {
  return Number(energy) + Number(sleep) + Number(focus) - Number(stress) * 2;
};

const getConditionInfo = (score) => {
  if (score >= 8) {
    return { key: 'stable', label: 'Stable' };
  }

  if (score >= 4) {
    return { key: 'moderate', label: 'Moderate Pressure' };
  }

  if (score >= 0) {
    return { key: 'overwhelmed', label: 'Overwhelmed' };
  }

  return { key: 'critical', label: 'Critical Stress' };
};

/**
 * @route   POST /api/wellbeing/check-ins
 * @desc    Submit a new wellbeing check-in
 * @access  Private
 */
const createCheckin = async (req, res) => {
  try {
    const { energy, sleep, focus, stress, note = '' } = req.body;

    const numericFields = { energy, sleep, focus, stress };
    const fieldKeys = Object.keys(numericFields);

    for (const key of fieldKeys) {
      const value = Number(numericFields[key]);

      if (!Number.isFinite(value) || value < 1 || value > 5) {
        return res.status(400).json({
          success: false,
          message: `${key} must be a number between 1 and 5`
        });
      }
    }

    const score = calculateScore(numericFields);
    const condition = getConditionInfo(score);

    const checkin = await WellbeingCheckin.create({
      user: req.user.id,
      energy: Number(energy),
      sleep: Number(sleep),
      focus: Number(focus),
      stress: Number(stress),
      score,
      conditionKey: condition.key,
      conditionLabel: condition.label,
      note: String(note || '').trim(),
      submittedAt: new Date()
    });

    return res.status(201).json({
      success: true,
      message: 'Wellbeing check-in submitted successfully',
      data: {
        checkin
      }
    });
  } catch (error) {
    console.error('Create wellbeing check-in error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error submitting wellbeing check-in',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/wellbeing/check-ins
 * @desc    Get current user's wellbeing check-in history
 * @access  Private
 */
const getMyCheckins = async (req, res) => {
  try {
    const requestedLimit = Number(req.query.limit);
    const limit = Number.isFinite(requestedLimit) && requestedLimit > 0
      ? Math.min(requestedLimit, 100)
      : 30;

    const checkins = await WellbeingCheckin.find({ user: req.user.id })
      .sort({ submittedAt: -1 })
      .limit(limit);

    return res.status(200).json({
      success: true,
      message: 'Wellbeing history retrieved successfully',
      data: {
        count: checkins.length,
        checkins
      }
    });
  } catch (error) {
    console.error('Get wellbeing history error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving wellbeing history',
      error: error.message
    });
  }
};

module.exports = {
  createCheckin,
  getMyCheckins
};
