-- Backfill user_roles for existing users (using current profiles.role values)
INSERT INTO public.user_roles (user_id, role)
SELECT p.id, (p.role::public.app_role)
FROM public.profiles p
WHERE p.role IN ('patient','doctor','admin')
ON CONFLICT (user_id) DO NOTHING;

-- Create a non-PII patient directory (no emails) for doctor-facing UIs
CREATE TABLE IF NOT EXISTS public.patient_directory (
  patient_id uuid PRIMARY KEY,
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.patient_directory ENABLE ROW LEVEL SECURITY;

-- Backfill
INSERT INTO public.patient_directory (patient_id, first_name, last_name, status)
SELECT p.id, p.first_name, p.last_name, p.status
FROM public.profiles p
WHERE p.role = 'patient'
ON CONFLICT (patient_id) DO UPDATE
SET first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    status = EXCLUDED.status,
    updated_at = now();

-- Sync trigger from profiles
CREATE OR REPLACE FUNCTION public.sync_patient_directory_from_profiles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'patient' THEN
    INSERT INTO public.patient_directory (patient_id, first_name, last_name, status)
    VALUES (NEW.id, COALESCE(NEW.first_name, ''), COALESCE(NEW.last_name, ''), COALESCE(NEW.status, 'active'))
    ON CONFLICT (patient_id) DO UPDATE
      SET first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          status = EXCLUDED.status,
          updated_at = now();
  ELSE
    DELETE FROM public.patient_directory WHERE patient_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_sync_patient_directory_profiles') THEN
    DROP TRIGGER trg_sync_patient_directory_profiles ON public.profiles;
  END IF;
END $$;

CREATE TRIGGER trg_sync_patient_directory_profiles
AFTER INSERT OR UPDATE OF first_name, last_name, role, status
ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_patient_directory_from_profiles();

-- RLS: patients can view self
DROP POLICY IF EXISTS "patient_directory_select_own" ON public.patient_directory;
CREATE POLICY "patient_directory_select_own"
ON public.patient_directory
FOR SELECT
TO authenticated
USING (auth.uid() = patient_id);

-- RLS: doctors can view only patients they have appointments with
DROP POLICY IF EXISTS "patient_directory_doctor_select_related" ON public.patient_directory;
CREATE POLICY "patient_directory_doctor_select_related"
ON public.patient_directory
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'doctor')
  AND EXISTS (
    SELECT 1
    FROM public.appointments a
    WHERE a.patient_id = patient_directory.patient_id
      AND a.doctor_id = auth.uid()
  )
);

-- RLS: admins can view all
DROP POLICY IF EXISTS "patient_directory_admin_select_all" ON public.patient_directory;
CREATE POLICY "patient_directory_admin_select_all"
ON public.patient_directory
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Tighten profiles: remove doctor access to other users' full profile rows (emails)
DROP POLICY IF EXISTS "profiles_doctors_read_their_patients" ON public.profiles;
