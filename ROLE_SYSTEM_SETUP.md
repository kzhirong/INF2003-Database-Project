# Role-Based Access Control System Setup Guide

## Overview

This CCA Management System now has a role-based access control system with two user types:
- **Students**: Can view CCAs, enroll, and access student dashboard
- **CCA Admins**: Can ONLY edit their specific CCA page (no student features)

## Setup Steps

### 1. Create Users Table in Supabase

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/hfxscxjcjowkcgwdauxb
2. Click **SQL Editor** in the left sidebar
3. Click **New query**
4. Copy the contents of `supabase-schema.sql` and paste it into the editor
5. Click **Run**

This creates:
- `users` table with `role` and `cca_id` columns
- Automatic user creation trigger (defaults to 'student' role)
- Row-level security policies

### 2. System Features

#### For Students:
- **Login**: `/` - Login and redirect to `/dashboard`
- **Account Creation**: Only system admins can create student accounts via `/admin`
- **Access**: Can view all CCAs, enroll, and see dashboard
- **Restrictions**: Cannot access any CCA edit pages

#### For CCA Admins:
- **Login**: `/` - Login and redirect to their CCA edit page
- **Access**: Can ONLY edit their assigned CCA page
- **Restrictions**: Cannot access dashboard, other CCAs, or any student features

### 3. Testing the System

#### Test Student Account:

1. Login as system admin at http://localhost:3000/
2. Go to `/admin` dashboard
3. Create a student account via the "Register Student" tab
4. Logout and login with the student credentials
5. Should redirect to `/dashboard`
6. Try accessing a CCA detail page - should see CCA details but NO "Edit Page" button
7. Try accessing `/ccas/{id}/edit` directly - should be redirected to `/dashboard`

#### Test CCA Admin Account:

You need to create a CCA admin account via system admin:

1. Login as system admin
2. Go to **Register CCA Admin** tab in `/admin`
3. Create a new CCA and CCA admin account
4. Copy the CCA ID from the success message
5. Logout and login with the CCA admin credentials
6. Should redirect to `/cca-admin/{cca_id}` (CCA admin dashboard)
7. Try accessing `/dashboard` - should be redirected back to CCA admin page
8. Try accessing different CCA edit page - should be redirected back to their assigned CCA

### 4. How It Works

#### Login Flow:
```
User Login → Check user role in DB
  ├─ Student → Redirect to /dashboard
  ├─ CCA Admin → Redirect to /cca-admin/{cca_id}
  └─ System Admin → Redirect to /admin
```

#### Middleware Protection:
```
Every Page Request → Check user role
  ├─ Student trying to access /ccas/{id}/edit → Redirect to /dashboard
  ├─ CCA Admin trying to access anything except their edit page → Redirect to /ccas/{cca_id}/edit
  └─ Accessing allowed page → Allow access
```

#### API Protection:
```
PUT/DELETE /api/ccas/{id}
  ├─ Check if user is authenticated
  ├─ Check if user role is 'cca_admin'
  ├─ Check if user's cca_id matches the {id} in URL
  └─ If all pass → Allow update/delete
      Else → Return 403 Forbidden
```

#### UI Protection:
- "Edit Page" button only shows if:
  - User role is `cca_admin` AND
  - User's `cca_id` matches current CCA's ID

### 5. Database Schema

**users table:**
```sql
id          UUID         (References auth.users)
email       TEXT         (User email)
role        TEXT         ('student', 'cca_admin', or 'system_admin')
created_at  TIMESTAMP
```

**student_details table:**
```sql
id             UUID         (Primary key)
user_id        UUID         (References users.id, UNIQUE)
student_id     TEXT         (7-digit student ID, UNIQUE)
course         TEXT         (Student's course)
year_of_study  INTEGER      (1-4)
phone_number   TEXT         (8-digit SG number, UNIQUE)
name           TEXT         (Student's full name)
```

**cca_admin_details table:**
```sql
id             UUID         (Primary key)
user_id        UUID         (References users.id, UNIQUE)
cca_id         TEXT         (MongoDB ObjectId of assigned CCA)
```

### 6. File Changes Summary

**New Files:**
- `src/lib/auth.ts` - Auth utility functions
- `src/app/admin/page.tsx` - System admin dashboard (user creation)
- `ROLE_SYSTEM_SETUP.md` - This guide

**Modified Files:**
- `src/components/LoginForm.tsx` - Role-based redirect after login
- `src/lib/supabase/middleware.ts` - Role-based access control
- `src/app/ccas/[id]/page.tsx` - Hide edit button for non-admins
- `src/app/api/ccas/[id]/route.ts` - API protection for PUT/DELETE

### 7. Future Enhancements

- Allow one user to be admin of multiple CCAs
- Add password reset functionality
- Add user management features (edit, disable, delete users)
- Add audit logs for admin actions
- Add email notifications for account creation

## Troubleshooting

**Issue: User created but no role assigned**
- Check that the admin API is properly inserting into users table
- Verify role is being set correctly in the request

**Issue: CCA admin can't edit their page**
- Verify `cca_id` in cca_admin_details table matches MongoDB ObjectId exactly
- Check browser console for errors
- Ensure the CCA actually exists in MongoDB

**Issue: Redirect loop**
- Check middleware is allowing login page
- Verify user has valid role in database
- Check that the user has corresponding detail table entry (student_details or cca_admin_details)

**Issue: "Unauthorized" when editing**
- Check if user is logged in
- Verify user's role is 'cca_admin'
- Verify cca_id in cca_admin_details matches the CCA being edited

**Issue: Student account missing details**
- Ensure student_details record was created with the user
- Check that all required fields (name, student_id, course, year_of_study) are provided
