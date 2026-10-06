/**
 * Department mappings based on category
 */
const CATEGORY_DEPARTMENT_MAP = {
  'IT / Wi-Fi': 'IT Department',
  'Hostel': 'Hostel Department',
  'Electrical': 'Electrical Department',
  'Plumbing': 'Plumbing Department',
  'Library': 'Library Department',
  'Transport': 'Transport Department',
  'Classroom': 'Campus Maintenance',
  'ID Card': 'Student Affairs',
  'Cleaning/Maintenance': 'Housekeeping Department',
  'Other': 'General Administration'
};

/**
 * Returns the default assigned department for a category
 */
function getAutoAssignedDepartment(category) {
  return CATEGORY_DEPARTMENT_MAP[category] || 'General Administration';
}

/**
 * Computes estimated completion date based on priority and category SLA
 * Low: 72 hours
 * Medium: 36 hours
 * High: 12 hours
 */
function calculateEstimatedCompletion(priority) {
  const now = new Date();
  let hoursToAdd = 36; // default Medium

  switch (priority) {
    case 'High':
      hoursToAdd = 12;
      break;
    case 'Medium':
      hoursToAdd = 36;
      break;
    case 'Low':
      hoursToAdd = 72;
      break;
    default:
      hoursToAdd = 36;
  }

  return new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000);
}

/**
 * Checks if a request needs escalation:
 * If High priority and unresolved (not Completed) past estimated completion time.
 */
function checkEscalationStatus(request) {
  if (request.status === 'Completed') return false;
  if (request.priority === 'High' && request.estimatedCompletion) {
    return new Date() > new Date(request.estimatedCompletion);
  }
  return false;
}

module.exports = {
  CATEGORY_DEPARTMENT_MAP,
  getAutoAssignedDepartment,
  calculateEstimatedCompletion,
  checkEscalationStatus
};
