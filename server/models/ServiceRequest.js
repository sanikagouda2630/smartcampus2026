const mongoose = require('mongoose');

const historySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Assigned', 'In Progress', 'Completed']
    },
    updatedBy: {
      type: String,
      required: true,
      default: 'System'
    },
    note: {
      type: String,
      default: ''
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const serviceRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    studentName: {
      type: String,
      required: true
    },
    studentEmail: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
        'IT / Wi-Fi',
        'Hostel',
        'Electrical',
        'Plumbing',
        'Library',
        'Transport',
        'Classroom',
        'ID Card',
        'Cleaning/Maintenance',
        'Other'
      ]
    },
    description: {
      type: String,
      required: [true, 'Please enter a description of the problem'],
      trim: true
    },
    priority: {
      type: String,
      required: true,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    },
    assignedDepartment: {
      type: String,
      default: 'Unassigned'
    },
    assignedPerson: {
      type: String,
      default: 'Unassigned'
    },
    status: {
      type: String,
      enum: ['Pending', 'Assigned', 'In Progress', 'Completed'],
      default: 'Pending',
      index: true
    },
    estimatedCompletion: {
      type: Date
    },
    isEscalated: {
      type: Boolean,
      default: false
    },
    remarks: {
      type: String,
      default: ''
    },
    history: [historySchema]
  },
  {
    timestamps: true
  }
);

// Compound index for search and filtering
serviceRequestSchema.index({ requestId: 1, studentName: 1, status: 1, category: 1, priority: 1 });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
