/**
 * Wellbeing Check-in Model
 * Stores daily wellbeing submissions for each user
 */

const mongoose = require('mongoose');

const wellbeingCheckinSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    energy: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    sleep: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    focus: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    stress: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    score: {
      type: Number,
      required: true
    },
    conditionKey: {
      type: String,
      required: true,
      enum: ['stable', 'moderate', 'overwhelmed', 'critical']
    },
    conditionLabel: {
      type: String,
      required: true
    },
    note: {
      type: String,
      trim: true,
      default: ''
    },
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

wellbeingCheckinSchema.index({ user: 1, submittedAt: -1 });

module.exports = mongoose.model('WellbeingCheckin', wellbeingCheckinSchema);
