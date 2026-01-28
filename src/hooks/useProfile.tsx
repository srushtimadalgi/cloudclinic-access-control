
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AppRole = 'patient' | 'doctor' | 'admin';

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  /** Role is sourced from public.user_roles (not from profiles) */
  role: AppRole;
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

      const [profileRes, roleRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle(),
        supabase
          // NOTE: This table may not exist in generated TS types yet; we intentionally treat it as untyped.
          .from('user_roles' as any)
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle(),
      ]);

      if (profileRes.error) {
        console.error('Profile fetch error:', profileRes.error);
        throw profileRes.error;
      }
      if (roleRes.error) {
        console.error('Role fetch error:', roleRes.error);
        throw roleRes.error;
      }

      const profile = profileRes.data as any;
      if (!profile) return null;

      const roleFromTable = (roleRes as any).data?.role as AppRole | undefined;
      const role = (roleFromTable ?? (profile.role as AppRole | undefined) ?? 'patient') as AppRole;
      return { ...profile, role } as Profile;
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
