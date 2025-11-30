# CCA Management System - User Manual

## Table of Contents
1. [System Overview](#system-overview)
2. [Prerequisites](#prerequisites)
3. [Installation & Setup](#installation--setup)
4. [Running the Application](#running-the-application)
5. [Accessing the Application](#accessing-the-application)
6. [User Accounts & Credentials](#user-accounts--credentials)
7. [Troubleshooting](#troubleshooting)

---

## System Overview

The CCA Management System is a web-based application for managing Co-Curricular Activities (CCAs) at educational institutions.

### Technology Stack
- **Frontend**: Next.js 15.5.3 with React 19 and Tailwind CSS
- **Backend**: Next.js API Routes
- **Databases**:
  - Supabase (PostgreSQL) - User authentication, attendance, sessions, events
  - MongoDB Atlas - CCA documents and content

### User Roles
- **System Admin** - Manages all user accounts (students and CCA admins)
- **CCA Admin** - Manages their assigned CCA (members, sessions, events, attendance)
- **Student** - Views CCAs, enrolls in activities, marks attendance

---

## Prerequisites

Ensure you have the following installed on your system:

### Required Software
- **Node.js** (version 20.x or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- A modern web browser (Chrome, Firefox, Edge, or Safari)

### Verify Installation

Open a terminal/command prompt and run:

```bash
node --version   # Should show v20.x.x or higher
npm --version    # Should show 10.x.x or higher
```

If you see version numbers, you're ready to proceed.

---

## Installation & Setup

### Step 1: Extract the Project Files

Extract the provided ZIP file to your desired location.

### Step 2: Navigate to Project Directory

Open a terminal/command prompt and navigate to the project folder:

```bash
cd path/to/2003-database-project
```

### Step 3: Install Dependencies

Run the following command to install all required packages:

```bash
npm install
```

This will install:
- Next.js and React
- Supabase client libraries
- MongoDB driver
- Recharts (for analytics)
- Tailwind CSS
- Other dependencies

**Note**: This may take 2-5 minutes depending on your internet connection.

### Step 4: Verify Environment Configuration

The `.env.local` file is included in the submission with all necessary database credentials and API keys pre-configured. Verify it exists in the project root:

```bash
# On Mac/Linux:
ls -la .env.local

# On Windows:
dir .env.local
```

**Important**: Do not modify the `.env.local` file. All credentials are pre-configured.

---

## Running the Application

### Start the Development Server

In the project directory, run:

```bash
npm run dev
```

You should see output similar to:

```
  ▲ Next.js 15.5.3
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Starting...
 ✓ Ready in 2.3s
```

### Access the Application

Open your web browser and navigate to:

```
http://localhost:3000
```

You should see the CCA Management System landing page.

### Stopping the Server

To stop the development server, press `Ctrl+C` in the terminal.

---

## Accessing the Application

### System Administrator Access

**Login Credentials**:
- **URL**: `http://localhost:3000`
- **Email**: `admin1@sit.singaporetech.edu.sg`
- **Password**: `Password@123`

**Admin Dashboard**: After login, navigate to `http://localhost:3000/admin`

**Admin Capabilities**:
- Create student accounts
- Create CCA admin accounts
- View all users
- Manage user details

---

### CCA Administrator Access

**Login Credentials**:
- **Email**: `dragonboat@sit.singaporetech.edu.sg`
- **Password**: `Password@123`

**CCA Admin Dashboard**: `http://localhost:3000/cca-admin/{cca-id}`

**CCA Admin Capabilities**:
1. **Manage Members** (`/cca-admin/{cca-id}/members`)
   - Add students by Student ID
   - Remove members
   - View member list with details

2. **Manage Sessions** (`/cca-admin/{cca-id}/sessions`)
   - Create practice sessions
   - Mark attendance
   - Delete sessions (CASCADE DELETE demo)

3. **Manage Events** (`/cca-admin/{cca-id}/events`)
   - Create events with registration
   - Track attendees
   - Delete events (CASCADE DELETE demo)

4. **Analytics Dashboard** (`/cca-admin/{cca-id}/analytics`)
   - View member count, session count, event count
   - Average attendance rate
   - Attendance trend chart (parallel queries + aggregation demo)

---

### Student Access

**Sample Student Credentials**:
- **Email**: `2402819@sit.singaporetech.edu.sg`
- **Student ID**: `2402819`
- **Password**: `Password@123`

**Student Features**:
1. **Browse CCAs** - Landing page (`http://localhost:3000`)
2. **Student Dashboard** - `http://localhost:3000/dashboard`
3. **View CCA Details** - Click on any CCA card
4. **Join CCAs** - Contact CCA admin to add you by Student ID

---

## User Accounts & Credentials

### Pre-configured Accounts

The system comes with pre-configured accounts for demonstration:

| Role | Email | Password | Student ID |
|------|-------|----------|------------|
| System Admin | `admin1@sit.singaporetech.edu.sg` | `Password@123` | N/A |
| CCA Admin | `dragonboat@sit.singaporetech.edu.sg` | `Password@123` | N/A |
| Student | `2402819@sit.singaporetech.edu.sg` | `Password@123` | `2402819` |

**Note**: Additional accounts may have been created. Check with the submission documentation for a complete list.

---

## Key Features to Demonstrate

### 1. Parallel Query Execution + Data Aggregation

**Location**: Analytics Dashboard (`/cca-admin/{cca-id}/analytics`)

**What to observe**:
- Summary cards showing member count, session count, event count, average attendance
- Attendance trend chart with interactive tooltips
- Data is fetched using 5 parallel database queries
- Client-side aggregation using `.reduce()` for grouping attendance records

**Technical Highlights**:
- Promise.all for concurrent query execution
- Batch fetching with `.in()` operator
- O(1) lookup performance with Maps
- Real-time analytics calculations

---

### 2. CASCADE DELETE with Referential Integrity

**Location**: Manage Sessions (`/cca-admin/{cca-id}/sessions`) or Manage Events (`/cca-admin/{cca-id}/events`)

**How to demonstrate**:
1. Navigate to Sessions page
2. Note a session has attendance records
3. Click **Delete** on a session
4. Confirm deletion
5. The session AND all related attendance records are automatically deleted

**Technical Highlights**:
- Database-level CASCADE DELETE constraints
- Automatic cleanup of child records
- Maintains referential integrity
- No manual cleanup code required

---

### 3. Complex Multi-Table Relationships

**Location**: Members Page (`/cca-admin/{cca-id}/members`)

**What to observe**:
- Member list showing Name, Student ID, Course
- Data comes from multiple related tables:
  - `cca_membership` → `student_details` → `courses`
- Optimized with batch fetching and Map lookups

---

### 4. Database Constraints

Throughout the application, you'll see:
- **CHECK constraints**: Student ID (7 digits), Phone number (8 digits starting with 8/9)
- **UNIQUE constraints**: Student ID, Phone number, Email
- **Foreign Key constraints**: Enforcing relationships between tables
- **Role-based access control**: System admin, CCA admin, Student roles

---

## Troubleshooting

### Issue: Port 3000 is already in use

**Solution 1**: Kill the process using port 3000
```bash
# On Mac/Linux:
lsof -ti:3000 | xargs kill -9

# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Solution 2**: Use a different port
```bash
PORT=3001 npm run dev
# Then access: http://localhost:3001
```

---

### Issue: Module not found errors

**Solution**: Reinstall dependencies
```bash
# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

---

### Issue: Application starts but shows database errors

**Check**:
1. Verify `.env.local` file exists in project root
2. Restart the development server:
   ```bash
   # Press Ctrl+C to stop, then:
   npm run dev
   ```

---

### Issue: "Cannot find module" after npm install

**Solution**: Clear npm cache and reinstall
```bash
npm cache clean --force
npm install
```

---

### Issue: Login fails with correct credentials

**Possible causes**:
1. Server still starting (wait 5-10 seconds after "Ready" message)
2. Database connection issue (check terminal for error messages)
3. Environment variables not loaded (restart server)

---

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│           CCA Management System                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Frontend: Next.js 15 + React 19 + Tailwind CSS    │
│                                                      │
├──────────────────┬──────────────────────────────────┤
│                  │                                   │
│   Supabase       │         MongoDB Atlas            │
│   (PostgreSQL)   │         (NoSQL)                  │
│                  │                                   │
│   • users        │   • ccas (rich documents)        │
│   • student_details                                 │
│   • cca_admin_details                               │
│   • cca_membership                                  │
│   • courses                                         │
│   • sessions                                        │
│   • events                                          │
│   • attendance                                      │
└──────────────────┴──────────────────────────────────┘
```

---

## Quick Start Summary

For a quick test of the application:

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the server**:
   ```bash
   npm run dev
   ```

3. **Open browser**: `http://localhost:3000`

4. **Login as System Admin**:
   - Email: `admin1@sit.singaporetech.edu.sg`
   - Password: `Password@123`

5. **Explore features**:
   - Go to `/admin` to see admin dashboard
   - Login as CCA admin to see CCA management
   - Check `/cca-admin/{cca-id}/analytics` for parallel query demo
   - Test CASCADE DELETE on sessions/events page

---

## Additional Notes

- All database credentials are pre-configured in `.env.local`
- The databases (Supabase and MongoDB) are already set up and populated with sample data
- Internet connection is required as databases are cloud-hosted
- No additional configuration is needed - just install and run

---

## Support

If you encounter any issues:

1. Check the terminal for error messages
2. Check browser console (F12) for client-side errors
3. Ensure Node.js version is 20.x or higher
4. Verify all dependencies installed successfully
5. Restart the development server

---

**End of User Manual**

The application is now ready to use. Follow the "Quick Start Summary" section for the fastest way to get started.
