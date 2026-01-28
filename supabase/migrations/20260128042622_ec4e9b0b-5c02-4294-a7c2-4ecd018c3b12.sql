-- Create a non-PII doctor directory for public/booking use-cases

CREATE TABLE IF NOT EXISTS public.doctor_directory (
  doctor_id uuid PRIMARY KEY,
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  specialty text NOT NULL DEFAULT '',
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.doctor_directory ENABLE ROW LEVEL SECURITY;

-- Public read is acceptable here because it contains no emails or license numbers
DROP POLICY IF EXISTS "doctor_directory_public_read" ON public.doctor_directory;
CREATE POLICY "doctor_directory_public_read"
ON public.doctor_directory
FOR SELECT
USING (true);

-- Only admins can modify directory rows directly
DROP POLICY IF EXISTS "doctor_directory_admin_write" ON public.doctor_directory;
CREATE POLICY "doctor_directory_admin_write"
ON public.doctor_directory
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Backfill from existing profiles+doctors
INSERT INTO public.doctor_directory (doctor_id, first_name, last_name, specialty, verified)
SELECT p.id, p.first_name, p.last_name, d.specialty, COALESCE(d.verified, false)
FROM public.profiles p
JOIN public.doctors d ON d.id = p.id
WHERE p.role = 'doctor'
ON CONFLICT (doctor_id) DO UPDATE
SET first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    specialty = EXCLUDED.specialty,
    verified = EXCLUDED.verified,
    updated_at = now();

-- Keep directory in sync (names/status from profiles, specialty/verified from doctors)
CREATE OR REPLACE FUNCTION public.sync_doctor_directory_from_profiles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'doctor' THEN
    INSERT INTO public.doctor_directory (doctor_id, first_name, last_name)
    VALUES (NEW.id, COALESCE(NEW.first_name, ''), COALESCE(NEW.last_name, ''))
    ON CONFLICT (doctor_id) DO UPDATE
      SET first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          updated_at = now();
  ELSE
    -- If user changed away from doctor, remove from directory
    DELETE FROM public.doctor_directory WHERE doctor_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_doctor_directory_from_doctors()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.doctor_directory (doctor_id, specialty, verified)
  VALUES (NEW.id, COALESCE(NEW.specialty, ''), COALESCE(NEW.verified, false))
  ON CONFLICT (doctor_id) DO UPDATE
    SET specialty = EXCLUDED.specialty,
        verified = EXCLUDED.verified,
        updated_at = now();

  RETURN NEW;
END;
$$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_sync_doctor_directory_profiles') THEN
    DROP TRIGGER trg_sync_doctor_directory_profiles ON public.profiles;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_sync_doctor_directory_doctors') THEN
    DROP TRIGGER trg_sync_doctor_directory_doctors ON public.doctors;
  END IF;
END $$;

CREATE TRIGGER trg_sync_doctor_directory_profiles
AFTER INSERT OR UPDATE OF first_name, last_name, role
ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_doctor_directory_from_profiles();

CREATE TRIGGER trg_sync_doctor_directory_doctors
AFTER INSERT OR UPDATE OF specialty, verified
ON public.doctors
FOR EACH ROW
EXECUTE FUNCTION public.sync_doctor_directory_from_doctors();

-- Remove the risky policy that exposes doctor emails via profiles
DROP POLICY IF EXISTS "profiles_read_active_doctors" ON public.profiles;

-- Remove the old doctors_public view if present (it can confuse scanners and isn't needed now)
DROP VIEW IF EXISTS public.doctors_public;
