-- Add new columns to existing users table
-- Run this if the users table already exists

-- Add student information columns
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS full_name TEXT NOT NULL DEFAULT 'Student',
ADD COLUMN IF NOT EXISTS student_id TEXT,
ADD COLUMN IF NOT EXISTS course TEXT,
ADD COLUMN IF NOT EXISTS year_of_study INTEGER,
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Update the trigger function to handle new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, full_name, student_id, course, year_of_study, phone_number)
  VALUES (
    NEW.id,
    NEW.email,
    'student',
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student'),
    NEW.raw_user_meta_data->>'student_id',
    NEW.raw_user_meta_data->>'course',
    CAST(NEW.raw_user_meta_data->>'year_of_study' AS INTEGER),
    NEW.raw_user_meta_data->>'phone_number'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
