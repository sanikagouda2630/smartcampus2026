const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const ServiceRequest = require('./models/ServiceRequest');
const Notification = require('./models/Notification');
const Counter = require('./models/Counter');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_campus_2026');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await ServiceRequest.deleteMany({});
    await Notification.deleteMany({});
    await Counter.deleteMany({});

    console.log('Cleaned old records...');

    // Initialize atomic Counter for Request IDs
    const currentYear = new Date().getFullYear();
    await Counter.create({
      _id: `requestId_${currentYear}`,
      seq: 4
    });

    // Create Admin and Student users
    const admin = await User.create({
      name: 'Dr. Sarah Mitchell (Chief Admin)',
      email: 'admin@campus.edu',
      password: 'Admin@123',
      role: 'admin',
      department: 'Facilities & Campus Operations'
    });

    const studentAlex = await User.create({
      name: 'Alex Rivera',
      email: 'student@campus.edu',
      password: 'Student@123',
      role: 'student',
      department: 'Computer Science & Eng'
    });

    const studentEmma = await User.create({
      name: 'Emma Watson',
      email: 'emma@campus.edu',
      password: 'Student@123',
      role: 'student',
      department: 'Biotechnology'
    });

    console.log('Users created successfully.');

    // Sample Requests
    const req1 = await ServiceRequest.create({
      requestId: `REQ-${currentYear}-0001`,
      studentId: studentAlex._id,
      studentName: studentAlex.name,
      studentEmail: studentAlex.email,
      category: 'IT / Wi-Fi',
      description: 'Hostel Block B 3rd Floor Wi-Fi access point is down and frequent drops occur during online lecture hours.',
      priority: 'High',
      assignedDepartment: 'IT Department',
      assignedPerson: 'Marcus Vance (Network Eng.)',
      status: 'In Progress',
      estimatedCompletion: new Date(Date.now() + 6 * 60 * 60 * 1000),
      isEscalated: false,
      remarks: 'Access point rebooted; testing optic fiber trunk switch port now.',
      history: [
        {
          status: 'Pending',
          updatedBy: studentAlex.name,
          note: 'Service request submitted by student.',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
        },
        {
          status: 'Assigned',
          updatedBy: admin.name,
          note: 'Assigned to IT Department (Marcus Vance)',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000)
        },
        {
          status: 'In Progress',
          updatedBy: 'Marcus Vance',
          note: 'Diagnostics initiated on router AP-B-302.',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
        }
      ]
    });

    const req2 = await ServiceRequest.create({
      requestId: `REQ-${currentYear}-0002`,
      studentId: studentAlex._id,
      studentName: studentAlex.name,
      studentEmail: studentAlex.email,
      category: 'Electrical',
      description: 'Ceiling projector power outlet in Seminar Hall 2 sparking when plugged in.',
      priority: 'High',
      assignedDepartment: 'Electrical Department',
      assignedPerson: 'Rajesh Kumar (Technician)',
      status: 'Completed',
      estimatedCompletion: new Date(Date.now() - 10 * 60 * 60 * 1000),
      isEscalated: false,
      remarks: 'Socket and internal circuit fuse replaced. Tested with high-load device safely.',
      history: [
        {
          status: 'Pending',
          updatedBy: studentAlex.name,
          note: 'Service request submitted by student.',
          timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000)
        },
        {
          status: 'Assigned',
          updatedBy: admin.name,
          note: 'Assigned to Electrical Department (Rajesh Kumar)',
          timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000)
        },
        {
          status: 'In Progress',
          updatedBy: 'Rajesh Kumar',
          note: 'Power isolated; safety inspection underway.',
          timestamp: new Date(Date.now() - 15 * 60 * 60 * 1000)
        },
        {
          status: 'Completed',
          updatedBy: 'Rajesh Kumar',
          note: 'Socket and internal circuit fuse replaced. Tested with high-load device safely.',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000)
        }
      ]
    });

    const req3 = await ServiceRequest.create({
      requestId: `REQ-${currentYear}-0003`,
      studentId: studentEmma._id,
      studentName: studentEmma.name,
      studentEmail: studentEmma.email,
      category: 'Plumbing',
      description: 'Water leakage in Hostel 3 washroom pipe on 2nd floor, causing floor accumulation.',
      priority: 'Medium',
      assignedDepartment: 'Plumbing Department',
      assignedPerson: 'Unassigned',
      status: 'Pending',
      estimatedCompletion: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isEscalated: false,
      remarks: 'Request awaiting department review',
      history: [
        {
          status: 'Pending',
          updatedBy: studentEmma.name,
          note: 'Service request submitted. Auto-routed to Plumbing Department.',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
        }
      ]
    });

    const req4 = await ServiceRequest.create({
      requestId: `REQ-${currentYear}-0004`,
      studentId: studentAlex._id,
      studentName: studentAlex.name,
      studentEmail: studentAlex.email,
      category: 'Library',
      description: 'Digital catalog search kiosk 4 touch screen is unresponsive.',
      priority: 'Low',
      assignedDepartment: 'Library Department',
      assignedPerson: 'Librarian Desk',
      status: 'Assigned',
      estimatedCompletion: new Date(Date.now() + 48 * 60 * 60 * 1000),
      isEscalated: false,
      remarks: 'Assigned to IT hardware assistant in library.',
      history: [
        {
          status: 'Pending',
          updatedBy: studentAlex.name,
          note: 'Service request submitted by student.',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000)
        },
        {
          status: 'Assigned',
          updatedBy: admin.name,
          note: 'Assigned to Library Department (Librarian Desk)',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
        }
      ]
    });

    // Sample Notifications for Alex
    await Notification.create([
      {
        userId: studentAlex._id,
        requestId: req2._id,
        ticketCode: req2.requestId,
        message: `🎉 Great news! Your request ${req2.requestId} has been marked as Completed. Note: Socket and internal circuit fuse replaced.`,
        isRead: true,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
      },
      {
        userId: studentAlex._id,
        requestId: req1._id,
        ticketCode: req1.requestId,
        message: `Update on ${req1.requestId}: Status is now "In Progress". Note: Diagnostics initiated on router AP-B-302.`,
        isRead: false,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      }
    ]);

    console.log('✅ Seed completed successfully!');
    console.log('----------------------------------------------------');
    console.log('Default Demo Accounts:');
    console.log('Admin:   admin@campus.edu   / Admin@123');
    console.log('Student: student@campus.edu / Student@123');
    console.log('----------------------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
