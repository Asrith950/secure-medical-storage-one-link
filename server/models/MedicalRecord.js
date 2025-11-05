const mongoose = require('mongoose');

const MedicalRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  recordType: {
    type: String,
    required: [true, 'Please specify record type'],
    enum: ['Report', 'Prescription', 'Lab Result', 'Scan', 'Other']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  fileUrl: {
    type: String,
    required: [true, 'Please upload a file']
  },
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  doctor: {
    name: String,
    specialty: String,
    contact: String
  },
  recordDate: {
    type: Date,
    default: Date.now
  },
  tags: [String],
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

// Add index for faster querying
MedicalRecordSchema.index({ user: 1, recordType: 1 });

module.exports = mongoose.model('MedicalRecord', MedicalRecordSchema);