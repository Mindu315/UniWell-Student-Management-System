/**
 * User Model
 * Defines the structure of user data in MongoDB
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Create user schema
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false // Don't return password by default
  },
  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
    trim: true
  },
  faculty: {
    type: String,
    required: [true, 'Faculty is required'],
    trim: true
  },
  degreeProgram: {
    type: String,
    required: [true, 'Degree program is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: 1,
    max: 4
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving to database
userSchema.pre('save', async function(next) {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Create and export User model
const User = mongoose.model('User', userSchema);

module.exports = User;
