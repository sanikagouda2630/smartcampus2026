# 🏛️ Smart Campus 2026 — Centralized Service Request Management System

A modern, full-stack campus management platform enabling students to submit service requests, track live statuses, and view audit history, while granting faculty and administrators tools to assign, triage, resolve, and analyze campus facility issues.

---

## 🌟 Key Highlights & Features

### 🎓 Student Portal
* **Account Registration & Authentication**: Student registration and secure JWT login.
* **Campus Services Catalog**: Categorized services for *IT / Wi-Fi*, *Hostel*, *Electrical*, *Plumbing*, *Library*, *Transport*, *Classroom*, *ID Card*, *Cleaning/Maintenance*, and *Other*.
* **Smart Request Creation**:
  * Category selection with auto-department routing preview.
  * Priority selector (*Low*, *Medium*, *High*) with live SLA estimated completion time.
  * Unique sequential Request ID generation (`REQ-2026-0001`, `REQ-2026-0002`...).
* **Request Tracking & History**:
  * Live status stepper (`Pending` ➔ `Assigned` ➔ `In Progress` ➔ `Completed`).
  * Chronological activity audit trail showing who updated the request, timestamps, and technician notes.
* **Search & Filters**: Search by Request ID, category, or problem keyword; filter by status and priority.
* **In-App Notification Bell**: Real-time notifications for ticket creation, department assignment, and status updates with unread counter.

### 🛡️ Admin & Faculty Operations Portal
* **Administrative Authentication**: Secure faculty/admin login.
* **Live KPI Dashboard**:
  * Total Requests, Pending, Assigned, In Progress, Completed.
  * High-Priority count & SLA Escalation indicator.
  * Average Resolution Time (calculated from actual completion timestamps).
* **Department Workload Distribution**: Visual cards showing active vs. resolved tickets across campus departments.
* **Unified Management Table**:
  * Search by Request ID, Student Name, or keywords.
  * Filter by Status, Department, and Priority.
  * Sort by Date or Priority.
* **Request Management Drawer**:
  * Department & technician assignment.
  * Status transition control (`Pending` ➔ `Assigned` ➔ `In Progress` ➔ `Completed`).
  * Adding progress notes and resolution remarks.
  * Viewing complete history audit trail.

---

## 🚀 Quick Start Guide

### 1. Default Demo Credentials

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@campus.edu` | `Admin@123` | Dr. Sarah Mitchell (Chief Admin, Facilities & Operations) |
| **Student** | `student@campus.edu` | `Student@123` | Alex Rivera (Computer Science & Engineering) |

*(One-click demo buttons are also provided directly on the Login screen for fast testing!)*

---

### 2. Backend Setup (`server/`)
```bash
cd server
npm install
npm run seed      # Populates demo users, sample campus requests, and notifications
npm start         # Runs Express API on http://localhost:5000
```

### 3. Frontend Setup (`client/`)
```bash
cd client
npm install
npm run dev       # Starts Vite React dev server on http://localhost:5173
```

---

## 🏗️ Technology Stack

* **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, Fetch API Client with JWT interceptors.
* **Backend**: Node.js, Express.js REST APIs.
* **Database**: MongoDB with Mongoose ODM.
* **Authentication**: JSON Web Tokens (JWT) + `bcryptjs` password hashing.
* **Unique ID Generation**: Atomic `$inc` MongoDB `Counter` for collision-free sequential IDs (`REQ-2026-XXXX`).
