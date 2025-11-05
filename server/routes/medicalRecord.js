const express = require('express');
const { body, validationResult, query } = require('express-validator');
const MedicalRecord = require('../models/MedicalRecord');
const { protect } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// @desc    Upload and create medical record
// @route   POST /api/medical-records
// @access  Private
router.post('/', [
  protect,
  upload.single('file'),
  body('title').notEmpty().withMessage('Title is required'),
  body('category').isIn(['Lab Results', 'X-Ray', 'MRI Scan', 'CT Scan', 'Prescription', 'Medical Report', 'Vaccination Record', 'Other']).withMessage('Invalid category'),
  body('date').isISO8601().withMessage('Please provide a valid date'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
], handleMulterError, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Delete uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, category, date, description } = req.body;

    const recordData = {
      user: req.user.id,
      title,
      recordType: category, // Map category to recordType for the model
      recordDate: new Date(date),
      description,
      uploadedAt: new Date()
    };

    // Add file information if file was uploaded
    if (req.file) {
      recordData.fileUrl = `/uploads/${req.file.filename}`;
      recordData.fileName = req.file.originalname;
      recordData.fileType = req.file.mimetype;
      recordData.fileSize = req.file.size;
    }

    const medicalRecord = await MedicalRecord.create(recordData);

    res.status(201).json({
      success: true,
      data: medicalRecord
    });
  } catch (error) {
    // Delete uploaded file if record creation fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get all medical records for user
// @route   GET /api/medical-records
// @access  Private
router.get('/', [
  protect,
  query('recordType').optional().isIn(['Report', 'Prescription', 'Lab Result', 'Scan', 'Other']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
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

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    let query = { user: req.user.id };

    // Filter by record type if provided
    if (req.query.recordType) {
      query.recordType = req.query.recordType;
    }

    // Search by title or description
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const total = await MedicalRecord.countDocuments(query);
    const records = await MedicalRecord.find(query)
      .sort({ recordDate: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: records.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: records
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single medical record
// @route   GET /api/medical-records/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    // Make sure user owns the record
    if (record.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this record'
      });
    }

    res.status(200).json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update medical record
// @route   PUT /api/medical-records/:id
// @access  Private
router.put('/:id', [
  protect,
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('recordType').optional().isIn(['Report', 'Prescription', 'Lab Result', 'Scan', 'Other']).withMessage('Invalid record type'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
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

    let record = await MedicalRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    // Make sure user owns the record
    if (record.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this record'
      });
    }

    const { title, recordType, description, doctorName, doctorSpecialty, doctorContact, tags } = req.body;

    const updateFields = {};
    if (title) updateFields.title = title;
    if (recordType) updateFields.recordType = recordType;
    if (description !== undefined) updateFields.description = description;
    if (doctorName || doctorSpecialty || doctorContact) {
      updateFields.doctor = {
        name: doctorName || record.doctor.name,
        specialty: doctorSpecialty || record.doctor.specialty,
        contact: doctorContact || record.doctor.contact
      };
    }
    if (tags) updateFields.tags = tags.split(',').map(tag => tag.trim());

    record = await MedicalRecord.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete medical record
// @route   DELETE /api/medical-records/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    // Make sure user owns the record
    if (record.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this record'
      });
    }

  // Delete the file from filesystem
  // record.fileUrl is stored like '/uploads/filename'; ensure we don't join with a leading slash (which would resolve to drive root on Windows)
  const relativeUrl = (record.fileUrl || '').replace(/^\/+/, '');
  const filePath = path.join(__dirname, '..', relativeUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await MedicalRecord.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Medical record deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;