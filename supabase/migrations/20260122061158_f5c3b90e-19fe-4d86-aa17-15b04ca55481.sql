-- Remove RLS policies that reference auth user_metadata (insecure) and replace with non-recursive checks

DROP POLICY IF EXISTS "profiles_patients_read_active_doctors" ON public.profiles;
DROP POLICY IF EXISTS "profiles_doctors_read_their_patients" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_read_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_update_all" ON public.profiles;

-- Any authenticated user can read active doctors (used by booking UI)
CREATE POLICY "profiles_read_active_doctors"
ON public.profiles
FOR SELECT
USING (
  role = 'doctor'
  AND status = 'active'
);

-- Doctors (identified by presence in public.doctors) can read patient profiles they have appointments with
CREATE POLICY "profiles_doctors_read_their_patients"
ON public.profiles
FOR SELECT
USING (
  role = 'patient'
  AND EXISTS (
    SELECT 1 FROM public.doctors d
    WHERE d.id = auth.uid()
  )
  AND EXISTS (
    SELECT 1
    FROM public.appointments a
    WHERE a.patient_id = profiles.id
      AND a.doctor_id = auth.uid()
  )
);
