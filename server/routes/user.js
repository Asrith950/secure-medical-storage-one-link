const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const MedicalRecord = require('../models/MedicalRecord');
const Reminder = require('../models/Reminder');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get user stats
// @route   GET /api/users/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get counts for user's data
    const [medicalRecordsCount, activeRemindersCount, user] = await Promise.all([
      MedicalRecord.countDocuments({ user: userId }),
      Reminder.countDocuments({ user: userId, isActive: true }),
      User.findById(userId)
    ]);

    const emergencyContactsCount = user.emergencyInfo?.emergencyContacts?.length || 0;

    res.status(200).json({
      success: true,
      totalRecords: medicalRecordsCount,
      activeReminders: activeRemindersCount,
      emergencyContacts: emergencyContactsCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', [
  protect,
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Please include a valid email'),
  body('phone').optional().isString().withMessage('Phone must be a string'),
  body('dateOfBirth').optional().isISO8601().withMessage('Please include a valid date'),
  body('gender').optional().isIn(['male', 'female', 'other', 'prefer-not-to-say']).withMessage('Please select a valid gender'),
  body('address').optional().isString().withMessage('Address must be a string')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const fieldsToUpdate = {};
    const { name, email, phone, dateOfBirth, gender, address } = req.body;

    if (name) fieldsToUpdate.name = name;
    if (phone) fieldsToUpdate.phone = phone;
    if (dateOfBirth) fieldsToUpdate.dateOfBirth = dateOfBirth;
    if (gender) fieldsToUpdate.gender = gender;
    if (address) fieldsToUpdate.address = address;
    
    if (email) {
      // Check if email is already taken by another user
      const emailExists = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
      fieldsToUpdate.email = email;
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Change password
// @route   PUT /api/users/password
// @access  Private
router.put('/password', [
  protect,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update emergency information
// @route   PUT /api/users/emergency-info
// @access  Private
router.put('/emergency-info', [
  protect,
  body('bloodGroup').optional().isString().withMessage('Blood group must be a string'),
  body('allergies').optional().isArray().withMessage('Allergies must be an array'),
  body('conditions').optional().isArray().withMessage('Conditions must be an array'),
  body('emergencyContacts').optional().isArray().withMessage('Emergency contacts must be an array')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { bloodGroup, allergies, conditions, emergencyContacts } = req.body;

    const emergencyInfo = {};
    if (bloodGroup !== undefined) emergencyInfo.bloodGroup = bloodGroup;
    if (allergies !== undefined) emergencyInfo.allergies = allergies;
    if (conditions !== undefined) emergencyInfo.conditions = conditions;
    if (emergencyContacts !== undefined) emergencyInfo.emergencyContacts = emergencyContacts;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { emergencyInfo },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: user.emergencyInfo
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Toggle dark mode
// @route   PUT /api/users/dark-mode
// @access  Private
router.put('/dark-mode', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.darkMode = !user.darkMode;
    await user.save();

    res.status(200).json({
      success: true,
      data: { darkMode: user.darkMode }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
router.put('/change-password', [
  protect,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number and one special character')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get login history
// @route   GET /api/users/login-history
// @access  Private
router.get('/login-history', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('lastLogin');

    res.status(200).json({
      success: true,
      data: {
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
router.delete('/account', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete all user's medical records
    await MedicalRecord.deleteMany({ user: userId });

    // Delete all user's reminders
    await Reminder.deleteMany({ user: userId });

    // Delete user account
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account'
    });
  }
});

module.exports = router;