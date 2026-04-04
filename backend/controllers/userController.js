/**
 * User Controller
 * Handles user profile updates and admin user management
 */

const User = require('../models/User');

const serializeUser = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  studentId: user.studentId,
  faculty: user.faculty,
  degreeProgram: user.degreeProgram,
  year: user.year,
  role: user.role,
  settings: user.settings,
  createdAt: user.createdAt
});

/**
 * @route   PUT /api/users/me
 * @desc    Update current user's profile
 * @access  Private
 */
const updateMe = async (req, res) => {
  try {
    const { fullName, faculty, degreeProgram, year } = req.body;

    // Find current user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update allowed fields
    if (fullName) user.fullName = fullName;
    if (faculty) user.faculty = faculty;
    if (degreeProgram) user.degreeProgram = degreeProgram;
    if (year) user.year = year;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: serializeUser(user)
      }
    });
  } catch (error) {
    console.error('Update me error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/users
 * @desc    Get all users (Admin only)
 * @access  Private/Admin
 */
const getAllUsers = async (req, res) => {
  try {
    // Find all users (excluding password)
    const users = await User.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        count: users.length,
        users
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting users',
      error: error.message
    });
  }
};

/**
 * @route   PUT /api/users/:id
 * @desc    Update user by ID (Admin only)
 * @access  Private/Admin
 */
const updateUserById = async (req, res) => {
  try {
    const { fullName, role, faculty, degreeProgram, year } = req.body;
    const userId = req.params.id;

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (fullName) user.fullName = fullName;
    if (role) user.role = role;
    if (faculty) user.faculty = faculty;
    if (degreeProgram) user.degreeProgram = degreeProgram;
    if (year) user.year = year;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: serializeUser(user)
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user by ID (Admin only)
 * @access  Private/Admin
 */
const deleteUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find and delete user
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

const getMySettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Settings retrieved successfully',
      data: {
        settings: user.settings
      }
    });
  } catch (error) {
    console.error('Get my settings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving settings',
      error: error.message
    });
  }
};

const updateMySettings = async (req, res) => {
  try {
    const {
      theme,
      dashboardView,
      emailNotifications,
      wellbeingReminders,
      studyReminders
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.settings) {
      user.settings = {};
    }

    if (theme) user.settings.theme = theme;
    if (dashboardView) user.settings.dashboardView = dashboardView;
    if (typeof emailNotifications === 'boolean') user.settings.emailNotifications = emailNotifications;
    if (typeof wellbeingReminders === 'boolean') user.settings.wellbeingReminders = wellbeingReminders;
    if (typeof studyReminders === 'boolean') user.settings.studyReminders = studyReminders;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        settings: user.settings,
        user: serializeUser(user)
      }
    });
  } catch (error) {
    console.error('Update my settings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating settings',
      error: error.message
    });
  }
};

module.exports = {
  updateMe,
  getMySettings,
  updateMySettings,
  getAllUsers,
  updateUserById,
  deleteUserById
};
