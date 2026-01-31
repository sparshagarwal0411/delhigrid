-- Fix RLS policy to allow user registration
-- This migration updates the RLS policies to properly handle user registration

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;

-- Create a function to insert user profile (can be called from client)
-- This function bypasses RLS and can be called by authenticated users
-- Note: Required parameters first, then optional ones with defaults
CREATE OR REPLACE FUNCTION public.create_user_profile(
  user_id UUID,
  user_first_name TEXT,
  user_last_name TEXT,
  user_email TEXT,
  user_ward_number INTEGER,
  user_phone TEXT DEFAULT NULL,
  user_age INTEGER DEFAULT NULL,
  user_sex TEXT DEFAULT NULL,
  user_gender TEXT DEFAULT NULL,
  user_role TEXT DEFAULT 'citizen'
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.users (
    id,
    first_name,
    last_name,
    email,
    phone,
    age,
    sex,
    gender,
    ward_number,
    role
  ) VALUES (
    user_id,
    user_first_name,
    user_last_name,
    user_email,
    user_phone,
    user_age,
    user_sex,
    user_gender,
    user_ward_number,
    user_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_user_profile TO authenticated;

-- Update RLS policies to be more permissive for inserts during registration
-- Allow users to insert their own profile if the id matches their auth.uid()
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to view their own data
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
