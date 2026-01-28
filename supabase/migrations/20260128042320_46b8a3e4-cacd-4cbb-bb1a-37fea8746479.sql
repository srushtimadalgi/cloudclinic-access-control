-- 1) Roles: move to dedicated table (avoid storing roles in profiles/users)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role' AND typnamespace = 'public'::regnamespace) THEN
    CREATE TYPE public.app_role AS ENUM ('patient', 'doctor', 'admin');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer helper (non-recursive)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- user_roles policies
DROP POLICY IF EXISTS "user_roles_select_own" ON public.user_roles;
CREATE POLICY "user_roles_select_own"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_roles_admin_manage" ON public.user_roles;
CREATE POLICY "user_roles_admin_manage"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2) Fix ERROR: prevent anonymous reads of PII in profiles
-- Ensure RLS is enabled (safe if already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop any overly-broad SELECT policies; keep existing self/doctor policies, but ensure all are authenticated.
-- (Dropping the known problematic policy names from earlier iterations)
DROP POLICY IF EXISTS "profiles_admin_read_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_update_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_patients_read_active_doctors" ON public.profiles;

-- Ensure self policies require authenticated
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Any authenticated user can read active doctor *profiles* (used by booking UI)
DROP POLICY IF EXISTS "profiles_read_active_doctors" ON public.profiles;
CREATE POLICY "profiles_read_active_doctors"
ON public.profiles
FOR SELECT
TO authenticated
USING (role = 'doctor' AND status = 'active');

-- Doctors (based on user_roles) can read patient profiles they have appointments with
DROP POLICY IF EXISTS "profiles_doctors_read_their_patients" ON public.profiles;
CREATE POLICY "profiles_doctors_read_their_patients"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  role = 'patient'
  AND public.has_role(auth.uid(), 'doctor')
  AND EXISTS (
    SELECT 1
    FROM public.appointments a
    WHERE a.patient_id = profiles.id
      AND a.doctor_id = auth.uid()
  )
);

-- Admins can read/update all profiles
DROP POLICY IF EXISTS "profiles_admin_read_all_via_roles" ON public.profiles;
CREATE POLICY "profiles_admin_read_all_via_roles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "profiles_admin_update_all_via_roles" ON public.profiles;
CREATE POLICY "profiles_admin_update_all_via_roles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3) Fix ERROR: doctor license numbers publicly accessible
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- Remove public SELECT
DROP POLICY IF EXISTS "Anyone can view doctors" ON public.doctors;

-- Logged-in users can see only non-sensitive doctor fields via a view
CREATE OR REPLACE VIEW public.doctors_public
WITH (security_invoker=on)
AS
SELECT id, specialty, verified, created_at
FROM public.doctors;

-- Policies for doctors table
DROP POLICY IF EXISTS "Doctors can insert their own record" ON public.doctors;
CREATE POLICY "Doctors can insert their own record"
ON public.doctors
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id AND public.has_role(auth.uid(), 'doctor'));

DROP POLICY IF EXISTS "Doctors can update their own record" ON public.doctors;
CREATE POLICY "Doctors can update their own record"
ON public.doctors
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Doctors can view own doctor record" ON public.doctors;
CREATE POLICY "Doctors can view own doctor record"
ON public.doctors
FOR SELECT
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all doctors" ON public.doctors;
CREATE POLICY "Admins can view all doctors"
ON public.doctors
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Public-ish access should go through doctors_public; allow authenticated users to SELECT that view
GRANT SELECT ON public.doctors_public TO authenticated;
GRANT SELECT ON public.doctors_public TO anon;

-- 4) Ensure signup trigger assigns roles into user_roles (keep profiles.role for backward-compat but don’t rely on it)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_role public.app_role;
BEGIN
  v_role := COALESCE((NEW.raw_user_meta_data ->> 'role')::public.app_role, 'patient');

  INSERT INTO public.profiles (id, first_name, last_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    NEW.email,
    v_role::text
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_role)
  ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

  IF v_role = 'doctor' THEN
    INSERT INTO public.doctors (id, license_number, specialty, verified)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data ->> 'license_number', ''),
      COALESCE(NEW.raw_user_meta_data ->> 'specialty', ''),
      false
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;
