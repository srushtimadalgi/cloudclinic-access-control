-- Update the appointments status check constraint to include all needed status values
ALTER TABLE public.appointments 
DROP CONSTRAINT appointments_status_check;

ALTER TABLE public.appointments 
ADD CONSTRAINT appointments_status_check 
CHECK (status IN ('pending', 'confirmed', 'approved', 'cancelled', 'canceled', 'completed', 'declined'));