-- Create function to notify patients when appointments are confirmed
CREATE OR REPLACE FUNCTION public.notify_appointment_confirmed()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for appointment confirmations
DROP TRIGGER IF EXISTS on_appointment_confirmed ON public.appointments;
CREATE TRIGGER on_appointment_confirmed
  AFTER UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_appointment_confirmed();