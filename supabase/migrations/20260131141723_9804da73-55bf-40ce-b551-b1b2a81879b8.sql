-- Add consultation fee column to doctors table
ALTER TABLE public.doctors 
ADD COLUMN consultation_fee INTEGER DEFAULT 500;

-- Add payment status to appointments table
ALTER TABLE public.appointments 
ADD COLUMN payment_status TEXT DEFAULT 'pending',
ADD COLUMN payment_id TEXT,
ADD COLUMN payment_amount INTEGER;

-- Add index for faster payment status queries
CREATE INDEX idx_appointments_payment_status ON public.appointments(payment_status);

COMMENT ON COLUMN public.doctors.consultation_fee IS 'Consultation fee in smallest currency unit (paise for INR)';
COMMENT ON COLUMN public.appointments.payment_status IS 'Payment status: pending, paid, failed, refunded';
COMMENT ON COLUMN public.appointments.payment_id IS 'Razorpay payment ID';
COMMENT ON COLUMN public.appointments.payment_amount IS 'Amount paid in smallest currency unit';