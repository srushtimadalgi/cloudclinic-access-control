-- Fix 1: Remove overly permissive profiles policy and add proper ones
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Users can view their own profile
CREATE POLICY "Users view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Patients can view active doctor profiles for booking appointments
CREATE POLICY "Patients view doctors for booking" 
ON public.profiles FOR SELECT 
USING (
  role = 'doctor' 
  AND status = 'active'
  AND EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.role = 'patient'
  )
);

-- Doctors can view patient profiles they have appointments with
CREATE POLICY "Doctors view appointment patients" 
ON public.profiles FOR SELECT 
USING (
  role = 'patient'
  AND EXISTS (
    SELECT 1 FROM public.profiles doc 
    WHERE doc.id = auth.uid() AND doc.role = 'doctor'
  )
  AND EXISTS (
    SELECT 1 FROM public.appointments a 
    WHERE a.patient_id = profiles.id 
    AND a.doctor_id = auth.uid()
  )
);

-- Admins can view all profiles for management
CREATE POLICY "Admins view all profiles" 
ON public.profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles admin 
    WHERE admin.id = auth.uid() AND admin.role = 'admin'
  )
);

-- Fix 2: Add unique constraint to doctor_patient_access for upsert operations
ALTER TABLE public.doctor_patient_access 
ADD CONSTRAINT doctor_patient_access_unique UNIQUE (doctor_id, patient_id);

-- Fix 3: Add constraints for appointment notes length
ALTER TABLE public.appointments
ADD CONSTRAINT appointments_notes_length CHECK (length(notes) <= 2000);