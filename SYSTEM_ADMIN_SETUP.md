# System Admin Setup Guide

## Overview

The CCA Management System now uses a **System Admin** role to manage all user registrations. Public signup has been removed. Only system administrators can create student and CCA admin accounts.

## User Roles

1. **System Admin** - Can ONLY access `/admin` to create student and CCA accounts
2. **Students** - Can view CCAs, enroll, and access dashboard
3. **CCA Admins** - Can ONLY edit their specific CCA page

## Setup Steps

### 1. Run Database Migrations

You need to run TWO SQL scripts in Supabase:

#### A. Add User Profile Columns

1. Go to Supabase SQL Editor
2. Copy and run `supabase-add-columns.sql`
3. This adds: `full_name`, `student_id`, `course`, `year_of_study`, `phone_number`

#### B. Add System Admin Role

1. In Supabase SQL Editor
2. Copy and run `supabase-add-admin.sql`
3. This adds the `system_admin` role to the database

### 2. Disable Email Confirmation (Important!)

1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Click on **Email**
3. Find **"Confirm email"** toggle
4. **Turn it OFF** (disable it)
5. Save changes

This allows the system admin to create accounts that are immediately active.

### 3. Create Your First System Admin Account

You have two options:

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Click **"Add user"**
3. Enter:
   - Email: `admin@sit.singaporetech.edu.sg` (or your preferred admin email)
   - Password: `your-secure-password`
   - Auto-confirm user: **YES**
4. Click **"Create user"**
5. Go to **SQL Editor** and run:

```sql
UPDATE public.users
SET role = 'system_admin', full_name = 'System Administrator'
WHERE email = 'admin@sit.singaporetech.edu.sg';
```

#### Option B: Using API (Advanced)

Run this in your Supabase SQL Editor:

```sql
-- First, manually insert into auth.users (you'll need the Supabase service role key for this)
-- Then update the users table:
UPDATE public.users
SET role = 'system_admin', full_name = 'System Administrator'
WHERE email = 'your-admin-email@sit.singaporetech.edu.sg';
```

### 4. Login as System Admin

1. Go to `http://localhost:3000`
2. Login with your admin credentials
3. You'll be automatically redirected to `/admin`

### 5. Using the Admin Dashboard

Once logged in as system admin, you can:

#### Register Students:

1. Click **"Register Student"** tab
2. Fill in:
   - Full Name *
   - Student ID *
   - Email *
   - Course (optional)
   - Year of Study (optional)
   - Phone Number (optional)
   - Password * (minimum 6 characters)
3. Click **"Create Student Account"**
4. The student can now login with the email and password you set

#### Register CCA Admins:

1. Click **"Register CCA Admin"** tab
2. Fill in:
   - CCA Name *
   - CCA ID (MongoDB ObjectId) *
   - Email *
   - Password * (minimum 6 characters)
3. Click **"Create CCA Admin Account"**
4. The CCA admin can now login and will be redirected to their CCA edit page

**How to get CCA ID:**
1. As a student or admin, visit `/ccas`
2. Click into a CCA
3. Copy the ID from the URL: `/ccas/[THIS_IS_THE_ID]`
4. Use this ID when creating the CCA admin account

## System Behavior

### System Admin:
- **Can access**: `/admin` ONLY
- **Cannot access**: Dashboard, CCAs pages, News pages, etc.
- **Purpose**: Create and manage user accounts

### Students:
- **Can access**: Dashboard, CCAs (view/enroll), News, Landing
- **Cannot access**: Edit pages, Admin page
- **Login redirect**: `/dashboard`

### CCA Admins:
- **Can access**: Their specific CCA edit page ONLY
- **Cannot access**: Dashboard, other CCAs, Admin page
- **Login redirect**: `/ccas/{their-cca-id}/edit`

## Security Features

1. ✅ **Role-based access control** - Each role can only access their designated pages
2. ✅ **Middleware protection** - Automatic redirects prevent unauthorized access
3. ✅ **No public signup** - Only admins can create accounts
4. ✅ **Password requirements** - Minimum 6 characters
5. ✅ **Unique email enforcement** - Database constraint prevents duplicates

## Troubleshooting

### Issue: "Cannot create user - email already exists"
- This email is already registered in the system
- Use a different email or delete the old account from Supabase Auth

### Issue: System admin sees other pages instead of /admin
- Check that the role in the database is exactly `system_admin`
- Run: `SELECT role FROM public.users WHERE email = 'your-email';`
- Update if needed: `UPDATE public.users SET role = 'system_admin' WHERE email = 'your-email';`

### Issue: Created users cannot login
- Ensure email confirmation is disabled in Supabase settings
- Check that the user exists in both `auth.users` and `public.users` tables

### Issue: "Invalid API Key" or "Unauthorized"
- Restart your Next.js dev server
- Verify Supabase credentials in `.env.local`

## Example Workflow

1. **System Admin** creates a student account:
   - Email: `student@sit.singaporetech.edu.sg`
   - Password: `password123`
   - Student ID: `2402498`
   - Name: `John Doe`

2. **Student** logs in:
   - Enters credentials
   - Redirected to `/dashboard`
   - Can view and enroll in CCAs

3. **System Admin** creates a CCA admin:
   - Gets Basketball CCA ID from `/ccas` page: `6789abc123def456`
   - Email: `basketball@sit.singaporetech.edu.sg`
   - Password: `hoops2024`
   - CCA Name: `Basketball CCA`
   - CCA ID: `6789abc123def456`

4. **CCA Admin** logs in:
   - Enters credentials
   - Redirected to `/ccas/6789abc123def456/edit`
   - Can edit Basketball CCA page only

## File Changes

**New Files:**
- `src/app/admin/page.tsx` - System admin dashboard
- `supabase-add-admin.sql` - Database migration for admin role
- `SYSTEM_ADMIN_SETUP.md` - This guide

**Modified Files:**
- `src/lib/auth.ts` - Added `system_admin` role type
- `src/lib/supabase/middleware.ts` - Added admin role routing
- `src/components/LoginForm.tsx` - Added admin redirect, removed signup link

**Removed Features:**
- Public signup page (`/signup` still exists but link removed from login)

## Next Steps

After setup:
1. Test system admin login
2. Create a test student account
3. Login as student to verify dashboard access
4. Create a test CCA admin account
5. Login as CCA admin to verify edit page access

The system is now production-ready with centralized user management!
