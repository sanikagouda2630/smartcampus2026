const ServiceRequest = require('../models/ServiceRequest');
const Notification = require('../models/Notification');
const { generateRequestId } = require('../utils/idGenerator');
const {
  getAutoAssignedDepartment,
  calculateEstimatedCompletion,
  checkEscalationStatus
} = require('../utils/autoAssign');

// @desc    Create a new service request
// @route   POST /api/requests
// @access  Protected (Student)
const createRequest = async (req, res) => {
  try {
    const { category, description, priority } = req.body;

    if (!category || !description) {
      return res.status(400).json({ success: false, message: 'Please provide category and description' });
    }

    const requestPriority = priority || 'Medium';
    const requestId = await generateRequestId();
    const suggestedDept = getAutoAssignedDepartment(category);
    const estimatedCompletion = calculateEstimatedCompletion(requestPriority);

    const initialHistory = [
      {
        status: 'Pending',
        updatedBy: req.user.name,
        note: `Service request submitted. Auto-routed to ${suggestedDept}.`,
        timestamp: new Date()
      }
    ];

    const serviceRequest = await ServiceRequest.create({
      requestId,
      studentId: req.user._id,
      studentName: req.user.name,
      studentEmail: req.user.email,
      category,
      description,
      priority: requestPriority,
      assignedDepartment: suggestedDept,
      assignedPerson: 'Unassigned',
      status: 'Pending',
      estimatedCompletion,
      isEscalated: false,
      remarks: 'Request awaiting department review',
      history: initialHistory
    });

    // Create confirmation notification for student
    await Notification.create({
      userId: req.user._id,
      requestId: serviceRequest._id,
      ticketCode: requestId,
      message: `Your request ${requestId} (${category}) has been submitted successfully.`
    });

    res.status(201).json({
      success: true,
      data: serviceRequest
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to submit service request' });
  }
};

// @desc    Get requests submitted by current student
// @route   GET /api/requests/my
// @access  Protected (Student)
const getMyRequests = async (req, res) => {
  try {
    const { search, status, priority } = req.query;
    let query = { studentId: req.user._id };

    if (status && status !== 'All') {
      query.status = status;
    }

    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { requestId: searchRegex },
        { category: searchRegex },
        { description: searchRegex },
        { assignedDepartment: searchRegex }
      ];
    }

    const requests = await ServiceRequest.find(query).sort({ createdAt: -1 });

    // Update escalation flag dynamically
    const updatedRequests = requests.map((reqItem) => {
      const escalated = checkEscalationStatus(reqItem);
      if (reqItem.isEscalated !== escalated) {
        reqItem.isEscalated = escalated;
        reqItem.save().catch(() => {});
      }
      return reqItem;
    });

    res.json({
      success: true,
      count: updatedRequests.length,
      data: updatedRequests
    });
  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch your requests' });
  }
};

// @desc    Get all campus requests with filtering, search, and sorting
// @route   GET /api/requests
// @access  Protected (Admin/Faculty)
const getAllRequests = async (req, res) => {
  try {
    const { search, status, department, priority, sortBy, sortOrder } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (department && department !== 'All') {
      query.assignedDepartment = department;
    }

    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { requestId: searchRegex },
        { studentName: searchRegex },
        { studentEmail: searchRegex },
        { category: searchRegex },
        { description: searchRegex }
      ];
    }

    // Determine sorting
    let sortObj = { createdAt: -1 };
    if (sortBy === 'priority') {
      // In MongoDB, we can sort by priority or fallback
      sortObj = { priority: sortOrder === 'asc' ? 1 : -1, createdAt: -1 };
    } else if (sortBy === 'date') {
      sortObj = { createdAt: sortOrder === 'asc' ? 1 : -1 };
    }

    const requests = await ServiceRequest.find(query).sort(sortObj);

    // Refresh escalation status
    const verifiedRequests = await Promise.all(
      requests.map(async (doc) => {
        const shouldEscalate = checkEscalationStatus(doc);
        if (doc.isEscalated !== shouldEscalate) {
          doc.isEscalated = shouldEscalate;
          await doc.save();
        }
        return doc;
      })
    );

    res.json({
      success: true,
      count: verifiedRequests.length,
      data: verifiedRequests
    });
  } catch (error) {
    console.error('Get all requests error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch requests' });
  }
};

// @desc    Get single request by ID
// @route   GET /api/requests/:id
// @access  Protected (Student owner or Admin)
const getRequestById = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    // Authorization check: If student, must be owner
    if (req.user.role === 'student' && request.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this request' });
    }

    // Check escalation
    const shouldEscalate = checkEscalationStatus(request);
    if (request.isEscalated !== shouldEscalate) {
      request.isEscalated = shouldEscalate;
      await request.save();
    }

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Get request by ID error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch request details' });
  }
};

// @desc    Assign request to department and technician
// @route   PATCH /api/requests/:id/assign
// @access  Protected (Admin/Faculty)
const assignRequest = async (req, res) => {
  try {
    const { department, assignedPerson, remarks } = req.body;
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    if (!department) {
      return res.status(400).json({ success: false, message: 'Department is required for assignment' });
    }

    const previousDept = request.assignedDepartment;
    const previousPerson = request.assignedPerson;

    request.assignedDepartment = department;
    request.assignedPerson = assignedPerson || 'Department Staff';

    // If still in Pending, advance status to Assigned
    if (request.status === 'Pending') {
      request.status = 'Assigned';
    }

    const note = remarks || `Assigned to ${department} (${request.assignedPerson}). Previously: ${previousDept} / ${previousPerson}`;

    request.history.push({
      status: request.status,
      updatedBy: req.user.name,
      note,
      timestamp: new Date()
    });

    if (remarks) {
      request.remarks = remarks;
    }

    await request.save();

    // Notify the student
    await Notification.create({
      userId: request.studentId,
      requestId: request._id,
      ticketCode: request.requestId,
      message: `Your request ${request.requestId} has been assigned to ${department} (${request.assignedPerson}).`
    });

    res.json({
      success: true,
      data: request,
      message: 'Request assigned successfully'
    });
  } catch (error) {
    console.error('Assign request error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to assign request' });
  }
};

// @desc    Update request status (Pending -> Assigned -> In Progress -> Completed)
// @route   PATCH /api/requests/:id/status
// @access  Protected (Admin/Faculty)
const updateRequestStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const validStatuses = ['Pending', 'Assigned', 'In Progress', 'Completed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const request = await ServiceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    const oldStatus = request.status;
    request.status = status;

    if (remarks) {
      request.remarks = remarks;
    }

    // If completed, clear escalation
    if (status === 'Completed') {
      request.isEscalated = false;
    }

    const note = remarks || `Status changed from ${oldStatus} to ${status}`;

    request.history.push({
      status,
      updatedBy: req.user.name,
      note,
      timestamp: new Date()
    });

    await request.save();

    // Create notification for student
    const notifMessage = status === 'Completed'
      ? `🎉 Great news! Your request ${request.requestId} has been marked as Completed. Note: ${remarks || 'Issue resolved.'}`
      : `Update on ${request.requestId}: Status is now "${status}". Note: ${remarks || 'In progress.'}`;

    await Notification.create({
      userId: request.studentId,
      requestId: request._id,
      ticketCode: request.requestId,
      message: notifMessage
    });

    res.json({
      success: true,
      data: request,
      message: `Status updated to ${status}`
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update request status' });
  }
};

module.exports = {
  createRequest,
  getMyRequests,
  getAllRequests,
  getRequestById,
  assignRequest,
  updateRequestStatus
};
