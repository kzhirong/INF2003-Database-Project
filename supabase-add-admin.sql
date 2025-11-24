-- Add system_admin role to the role check constraint
-- First, drop the existing constraint
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add new constraint with system_admin role
ALTER TABLE public.users
ADD CONSTRAINT users_role_check
CHECK (role IN ('student', 'cca_admin', 'system_admin'));

-- Update the trigger function to handle system_admin role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, full_name, student_id, course, year_of_study, phone_number)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'), -- Allow role to be set during signup
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.raw_user_meta_data->>'student_id',
    NEW.raw_user_meta_data->>'course',
    CAST(NEW.raw_user_meta_data->>'year_of_study' AS INTEGER),
    NEW.raw_user_meta_data->>'phone_number'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: Create the first system admin manually
-- Replace 'admin@sit.singaporetech.edu.sg' and 'your-secure-password' with your desired credentials
-- You'll need to sign up this user first through Supabase Auth UI or API, then run this:
-- UPDATE public.users
-- SET role = 'system_admin', full_name = 'System Administrator'
-- WHERE email = 'admin@sit.singaporetech.edu.sg';
