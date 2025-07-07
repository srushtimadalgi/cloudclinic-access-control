-- Check if handle_new_user function creates doctor records
-- Let's update the trigger to properly handle doctor signups

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (id, first_name, last_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'patient')
  );

  -- If user is a doctor, also create doctor record
  IF COALESCE(NEW.raw_user_meta_data ->> 'role', 'patient') = 'doctor' THEN
    INSERT INTO public.doctors (id, license_number, specialty, verified)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data ->> 'license_number', ''),
      COALESCE(NEW.raw_user_meta_data ->> 'specialty', ''),
      false
    );
  END IF;

  RETURN NEW;
END;
$function$;