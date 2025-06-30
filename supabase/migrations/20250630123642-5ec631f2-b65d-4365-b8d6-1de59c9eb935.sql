
-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create medical_reports table
CREATE TABLE public.medical_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create prescriptions table
CREATE TABLE public.prescriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  medication TEXT NOT NULL,
  dosage TEXT NOT NULL,
  duration TEXT NOT NULL,
  instructions TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create doctor_patient_access table for managing patient access
CREATE TABLE public.doctor_patient_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  access_granted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(patient_id, doctor_id)
);

-- Add RLS policies for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Add RLS policies for medical_reports
ALTER TABLE public.medical_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view their own reports" 
  ON public.medical_reports 
  FOR SELECT 
  USING (auth.uid() = patient_id);

CREATE POLICY "Patients can insert their own reports" 
  ON public.medical_reports 
  FOR INSERT 
  WITH CHECK (auth.uid() = patient_id);

-- Add RLS policies for prescriptions
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view their own prescriptions" 
  ON public.prescriptions 
  FOR SELECT 
  USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can view prescriptions they created" 
  ON public.prescriptions 
  FOR SELECT 
  USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can create prescriptions" 
  ON public.prescriptions 
  FOR INSERT 
  WITH CHECK (auth.uid() = doctor_id);

-- Add RLS policies for doctor_patient_access
ALTER TABLE public.doctor_patient_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view their own access records" 
  ON public.doctor_patient_access 
  FOR SELECT 
  USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can view access records for their patients" 
  ON public.doctor_patient_access 
  FOR SELECT 
  USING (auth.uid() = doctor_id);

CREATE POLICY "Patients can manage their own access records" 
  ON public.doctor_patient_access 
  FOR ALL 
  USING (auth.uid() = patient_id);

-- Add RLS policies for appointments to allow doctors to manage them
CREATE POLICY "Doctors can view all appointments" 
  ON public.appointments 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'doctor'
  ));

CREATE POLICY "Doctors can update appointments" 
  ON public.appointments 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'doctor'
  ));

CREATE POLICY "Patients can view their own appointments" 
  ON public.appointments 
  FOR SELECT 
  USING (auth.uid() = patient_id);

CREATE POLICY "Patients can create their own appointments" 
  ON public.appointments 
  FOR INSERT 
  WITH CHECK (auth.uid() = patient_id);

-- Enable RLS on appointments table
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
