# CCA Management System

A comprehensive web-based application for managing Co-Curricular Activities (CCAs) at educational institutions.

## Overview

This system provides a complete platform for managing CCAs, including user management, attendance tracking, event scheduling, and analytics. Built with Next.js 15 and a hybrid database architecture using Supabase (PostgreSQL) and MongoDB Atlas.

## Quick Start

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Login Credentials

| Role | Email | Password |
|------|-------|----------|
| System Admin | `admin1@sit.singaporetech.edu.sg` | `Password@123` |
| CCA Admin | `dragonboat@sit.singaporetech.edu.sg` | `Password@123` |
| Student | `2402819@sit.singaporetech.edu.sg` | `Password@123` |

## Key Features

### 1. Parallel Query Execution + Data Aggregation
- Analytics dashboard with 5 concurrent database queries
- Client-side aggregation using `.reduce()` for optimal performance
- Interactive attendance trend charts
- **Demo**: `/cca-admin/{cca-id}/analytics`

### 2. CASCADE DELETE with Referential Integrity
- Database-level cascade constraints
- Automatic cleanup of related records
- Maintains referential integrity without manual code
- **Demo**: Delete a session or event to see cascading deletes

### 3. Advanced Database Design
- 8 tables with complex relationships
- 8 foreign key constraints
- CHECK constraints with regex validation (7-digit Student ID, 8-digit SG phone)
- UNIQUE constraints (student_id, phone_number, email)
- 18 strategic performance indexes

### 4. Role-Based Access Control
- System Admin: Manage all users
- CCA Admin: Manage assigned CCA
- Student: Browse and join CCAs

## Technology Stack

- **Frontend**: Next.js 15.5.3, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Databases**:
  - Supabase (PostgreSQL) - Auth, users, attendance, sessions, events
  - MongoDB Atlas - CCA documents and content
- **Charts**: Recharts
- **Authentication**: Supabase Auth

## Documentation

📖 **For complete setup and usage instructions, see [USER_MANUAL.md](./USER_MANUAL.md)**

The user manual includes:
- Prerequisites and installation
- Environment configuration
- Detailed feature descriptions
- Troubleshooting guide

## Project Structure

```
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── (main)/        # Main application routes
│   │   ├── admin/         # System admin dashboard
│   │   └── api/           # API routes
│   ├── components/        # React components
│   └── lib/              # Utility functions and DB clients
├── supabase/
│   └── migrations/       # Database migrations and indexes
├── .env.local            # Environment variables (included in submission)
├── USER_MANUAL.md        # Complete setup and usage guide
└── README.md             # This file
```

## Database Schema

### Supabase (PostgreSQL)
- `users` - User authentication and roles
- `student_details` - Student information
- `cca_admin_details` - CCA admin assignments
- `cca_membership` - CCA enrollments
- `courses` - Available courses
- `sessions` - Practice sessions
- `events` - CCA events
- `attendance` - Attendance records

### MongoDB Atlas
- `ccas` - CCA documents with rich content

## Development

```bash
# Development mode with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Notes

- All database credentials are pre-configured in `.env.local`
- Internet connection required (cloud-hosted databases)
- Node.js 20.x or higher required
- No additional configuration needed - just install and run

## Support

For issues or questions, refer to the [Troubleshooting section](./USER_MANUAL.md#troubleshooting) in the User Manual.

---

Built with [Next.js](https://nextjs.org/) | [Supabase](https://supabase.com/) | [MongoDB](https://www.mongodb.com/)
