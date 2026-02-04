-- Drop the old RLS policy that uses profiles.role
DROP POLICY IF EXISTS "Doctors can view reports of accessible patients" ON public.medical_reports;

-- Create updated policy using the has_role function for proper role checking
CREATE POLICY "Doctors can view reports of accessible patients" 
ON public.medical_reports 
FOR SELECT 
USING (
  has_role(auth.uid(), 'doctor'::app_role) 
  AND doctor_has_patient_access(auth.uid(), patient_id)
);