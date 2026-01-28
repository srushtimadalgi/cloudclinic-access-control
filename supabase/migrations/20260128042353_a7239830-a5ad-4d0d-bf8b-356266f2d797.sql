-- Fix WARN: set search_path on existing SECURITY DEFINER / plpgsql functions

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.doctor_has_patient_access(doctor_id uuid, patient_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.doctor_patient_access 
    WHERE doctor_id = doctor_has_patient_access.doctor_id 
      AND patient_id = doctor_has_patient_access.patient_id 
      AND access_granted = true
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_prescription_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    NEW.patient_id,
    'New Prescription',
    'You have received a new prescription for ' || NEW.medication,
    'prescription'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_appointment_confirmed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only notify when status changes to confirmed
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.patient_id,
      'Appointment Confirmed',
      'Your appointment scheduled for ' || NEW.appointment_date || ' at ' || NEW.appointment_time || ' has been confirmed.',
      'appointment'
    );
  END IF;
  RETURN NEW;
END;
$$;
