-- Drop ALL existing policies on profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation" ON public.profiles;
DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Doctors view patient profiles" ON public.profiles;

-- Create simple, non-recursive RLS policies
-- Users can view their own profile (using auth.uid() directly, no subquery)
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Allow profile creation during signup
CREATE POLICY "Allow profile creation"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);