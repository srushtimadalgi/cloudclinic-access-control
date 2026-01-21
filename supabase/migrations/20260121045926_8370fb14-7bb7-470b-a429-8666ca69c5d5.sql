-- Add video consultation columns to appointments table
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS consultation_type text NOT NULL DEFAULT 'in-person',
ADD COLUMN IF NOT EXISTS video_room_id text;

-- Add constraint for consultation_type values
ALTER TABLE public.appointments 
ADD CONSTRAINT appointments_consultation_type_check 
CHECK (consultation_type IN ('in-person', 'video'));