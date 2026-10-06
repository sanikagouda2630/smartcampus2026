const ServiceRequest = require('../models/ServiceRequest');

// @desc    Get dashboard metrics & workload breakdown
// @route   GET /api/stats/dashboard
// @access  Protected (Admin/Faculty)
const getDashboardStats = async (req, res) => {
  try {
    const totalRequests = await ServiceRequest.countDocuments();
    const pendingRequests = await ServiceRequest.countDocuments({ status: 'Pending' });
    const assignedRequests = await ServiceRequest.countDocuments({ status: 'Assigned' });
    const inProgressRequests = await ServiceRequest.countDocuments({ status: 'In Progress' });
    const completedRequests = await ServiceRequest.countDocuments({ status: 'Completed' });
    const highPriorityRequests = await ServiceRequest.countDocuments({
      priority: 'High',
      status: { $ne: 'Completed' }
    });
    const escalatedRequests = await ServiceRequest.countDocuments({
      isEscalated: true,
      status: { $ne: 'Completed' }
    });

    // Calculate Average Resolution Time (in hours) for Completed requests
    const completedDocs = await ServiceRequest.find({
      status: 'Completed'
    }).select('createdAt history');

    let totalResolutionHours = 0;
    let resolvedCount = 0;

    completedDocs.forEach((doc) => {
      const completedHistoryItem = doc.history
        ?.filter((h) => h.status === 'Completed')
        .pop();

      if (completedHistoryItem && completedHistoryItem.timestamp) {
        const diffMs = new Date(completedHistoryItem.timestamp) - new Date(doc.createdAt);
        const hours = Math.max(0.1, diffMs / (1000 * 60 * 60));
        totalResolutionHours += hours;
        resolvedCount++;
      }
    });

    const averageResolutionTimeHours =
      resolvedCount > 0 ? (totalResolutionHours / resolvedCount).toFixed(1) : '2.5'; // fallback benchmark

    // Workload breakdown by Department
    const departmentWorkload = await ServiceRequest.aggregate([
      {
        $group: {
          _id: '$assignedDepartment',
          total: { $sum: 1 },
          active: {
            $sum: {
              $cond: [{ $in: ['$status', ['Pending', 'Assigned', 'In Progress']] }, 1, 0]
            }
          },
          completed: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    // Breakdown by Category
    const categoryBreakdown = await ServiceRequest.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalRequests,
        pendingRequests,
        assignedRequests,
        inProgressRequests,
        completedRequests,
        highPriorityRequests,
        escalatedRequests,
        averageResolutionHours: Number(averageResolutionTimeHours),
        departmentWorkload,
        categoryBreakdown
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to aggregate statistics' });
  }
};

module.exports = {
  getDashboardStats
};
