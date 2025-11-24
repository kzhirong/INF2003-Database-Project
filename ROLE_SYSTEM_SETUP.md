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
- **Signup**: `/signup` - Create new account (defaults to student role)
- **Login**: `/` - Login and redirect to `/dashboard`
- **Access**: Can view all CCAs, enroll, and see dashboard
- **Restrictions**: Cannot access any CCA edit pages

#### For CCA Admins:
- **Login**: `/` - Login and redirect to their CCA edit page
- **Access**: Can ONLY edit their assigned CCA page
- **Restrictions**: Cannot access dashboard, other CCAs, or any student features

### 3. Testing the System

#### Test Student Account:

1. Go to http://localhost:3000/signup
2. Create account with email: `student@sit.singaporetech.edu.sg`
3. Password: `password123`
4. Login - should redirect to `/dashboard`
5. Try accessing a CCA detail page - should see CCA details but NO "Edit Page" button
6. Try accessing `/ccas/{id}/edit` directly - should be redirected to `/dashboard`

#### Test CCA Admin Account:

You need to manually create a CCA admin account in Supabase:

1. First, create a test user via signup page
2. Go to Supabase Dashboard → **Authentication** → **Users**
3. Find the user you just created, copy their UUID
4. Go to **SQL Editor** and run:

```sql
UPDATE public.users
SET role = 'cca_admin', cca_id = 'YOUR_CCA_MONGODB_ID'
WHERE id = 'USER_UUID_HERE';
```

Replace:
- `YOUR_CCA_MONGODB_ID`: Get this from MongoDB (e.g., from the CCAs listing page URL)
- `USER_UUID_HERE`: The UUID you copied from the user

5. Login with that user - should redirect to `/ccas/{cca_id}/edit`
6. Try accessing `/dashboard` - should be redirected back to edit page
7. Try accessing different CCA edit page - should be redirected back to their assigned CCA

### 4. How It Works

#### Login Flow:
```
User Login → Check user role in DB
  ├─ Student → Redirect to /dashboard
  └─ CCA Admin → Redirect to /ccas/{cca_id}/edit
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
role        TEXT         ('student' or 'cca_admin')
cca_id      TEXT         (MongoDB ObjectId - only for CCA admins)
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

### 6. File Changes Summary

**New Files:**
- `src/lib/auth.ts` - Auth utility functions
- `src/app/signup/page.tsx` - Signup page
- `supabase-schema.sql` - Database schema
- `ROLE_SYSTEM_SETUP.md` - This guide

**Modified Files:**
- `src/components/LoginForm.tsx` - Role-based redirect after login
- `src/lib/supabase/middleware.ts` - Role-based access control
- `src/app/ccas/[id]/page.tsx` - Hide edit button for non-admins
- `src/app/api/ccas/[id]/route.ts` - API protection for PUT/DELETE

### 7. Future Enhancements

- Add admin dashboard to manage CCA admin assignments
- Allow one user to be admin of multiple CCAs
- Add email verification for new signups
- Add password reset functionality
- Create CCA admin registration flow with approval system

## Troubleshooting

**Issue: User created but no role assigned**
- Check if the trigger is created in Supabase
- Run the `supabase-schema.sql` again

**Issue: CCA admin can't edit their page**
- Verify `cca_id` in users table matches MongoDB ObjectId exactly
- Check browser console for errors

**Issue: Redirect loop**
- Check middleware is allowing signup and login pages
- Verify user has valid role in database

**Issue: "Unauthorized" when editing**
- Check if user is logged in
- Verify user's role is 'cca_admin'
- Verify cca_id matches the CCA being edited
