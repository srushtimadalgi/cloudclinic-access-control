-- Fix infinite recursion by removing policies that query profiles inside profiles policies

-- Drop ALL existing policies on public.profiles
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN (
    SELECT policyname
    FROM pg_policies
    WHERE schemaname='public' AND tablename='profiles'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
  END LOOP;
END $$;

-- Recreate non-recursive, role-aware policies

-- 1) Self access
CREATE POLICY "profiles_select_own"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- 2) Patients can read active doctors (for booking screens)
CREATE POLICY "profiles_patients_read_active_doctors"
ON public.profiles
FOR SELECT
USING (
  role = 'doctor'
  AND status = 'active'
  AND ((auth.jwt() -> 'user_metadata') ->> 'role') = 'patient'
);

-- 3) Doctors can read patient profiles they have appointments with
CREATE POLICY "profiles_doctors_read_their_patients"
ON public.profiles
FOR SELECT
USING (
  role = 'patient'
  AND ((auth.jwt() -> 'user_metadata') ->> 'role') = 'doctor'
  AND EXISTS (
    SELECT 1
    FROM public.appointments a
    WHERE a.patient_id = profiles.id
      AND a.doctor_id = auth.uid()
  )
);

-- 4) Admins can read/update all profiles (role from JWT metadata, not profiles table)
CREATE POLICY "profiles_admin_read_all"
ON public.profiles
FOR SELECT
USING (((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin');

CREATE POLICY "profiles_admin_update_all"
ON public.profiles
FOR UPDATE
USING (((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin');
