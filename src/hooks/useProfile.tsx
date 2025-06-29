
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface DoctorProfile {
  id: string;
  license_number: string;
  specialty: string;
  verified: boolean;
  created_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Profile fetch error:', error);
        throw error;
      }

      return data as Profile;
    },
    enabled: !!user,
  });
};

export const useDoctorProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['doctorProfile', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Doctor profile fetch error:', error);
        throw error;
      }

      return data as DoctorProfile;
    },
    enabled: !!user,
  });
};
