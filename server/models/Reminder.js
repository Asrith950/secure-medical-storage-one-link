const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
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
  medicineDetails: {
    name: {
      type: String,
      required: true
    },
    dosage: {
      type: String,
      required: true
    },
    frequency: {
      type: String,
      required: true
    },
    instructions: String
  },
  reminderTimes: [Date],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date
  },
  relatedPrescription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalRecord'
  },
  notificationType: {
    type: String,
    enum: ['email', 'push', 'both'],
    default: 'email'
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add index for faster querying
ReminderSchema.index({ user: 1, active: 1 });

module.exports = mongoose.model('Reminder', ReminderSchema);