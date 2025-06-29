
import { supabase } from '@/integrations/supabase/client';

export const createDummyUsers = async () => {
  try {
    // Create admin user
    const { data: adminData, error: adminError } = await supabase.auth.signUp({
      email: 'nishantus.btech23@rvu.edu.in',
      password: '123456admin',
      options: {
        data: {
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin'
        }
      }
    });

    if (adminError && !adminError.message.includes('already')) {
      console.error('Error creating admin:', adminError);
    }

    // Create doctor user
    const { data: doctorData, error: doctorError } = await supabase.auth.signUp({
      email: 'doctor@cloudclinic.com',
      password: 'doctor123',
      options: {
        data: {
          first_name: 'John',
          last_name: 'Smith',
          role: 'doctor',
          license_number: 'MD123456',
          specialty: 'General Practitioner'
        }
      }
    });

    if (doctorError && !doctorError.message.includes('already')) {
      console.error('Error creating doctor:', doctorError);
    }

    // Create patient user
    const { data: patientData, error: patientError } = await supabase.auth.signUp({
      email: 'patient@cloudclinic.com',
      password: 'patient123',
      options: {
        data: {
          first_name: 'Jane',
          last_name: 'Doe',
          role: 'patient'
        }
      }
    });

    if (patientError && !patientError.message.includes('already')) {
      console.error('Error creating patient:', patientError);
    }

    console.log('Dummy users creation completed');
  } catch (error) {
    console.error('Error in createDummyUsers:', error);
  }
};
