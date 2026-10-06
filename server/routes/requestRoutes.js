const express = require('express');
const router = express.Router();
const {
  createRequest,
  getMyRequests,
  getAllRequests,
  getRequestById,
  assignRequest,
  updateRequestStatus
} = require('../controllers/requestController');
const { protect, authorize } = require('../middleware/auth');

// Student creates a request
router.post('/', protect, createRequest);

// Student gets their submitted requests
router.get('/my', protect, getMyRequests);

// Admin gets all requests across the campus
router.get('/', protect, authorize('admin'), getAllRequests);

// Get single request details & history
router.get('/:id', protect, getRequestById);

// Admin assigns department and technician
router.patch('/:id/assign', protect, authorize('admin'), assignRequest);

// Admin updates status (Pending -> Assigned -> In Progress -> Completed)
router.patch('/:id/status', protect, authorize('admin'), updateRequestStatus);

module.exports = router;
