
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface DoctorAccess {
  doctorId: string;
  doctorName: string;
  specialty: string;
  hasAccess: boolean;
}

export const useDoctorAccess = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [doctorAccess, setDoctorAccess] = useState<DoctorAccess[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDoctorAccess();
    }
  }, [user]);

  const loadDoctorAccess = async () => {
    try {
      // Get doctors from a non-PII directory (no emails / license numbers)
      const { data: doctors, error: doctorsError } = await supabase
        .from('doctor_directory' as any)
        .select('doctor_id, first_name, last_name, specialty, verified');

      if (doctorsError) {
        console.error('Error fetching doctors:', doctorsError);
        throw doctorsError;
      }

      // Get access grants from database (server-side enforcement)
      const { data: accessGrants, error: accessError } = await supabase
        .from('doctor_patient_access')
        .select('doctor_id, access_granted')
        .eq('patient_id', user?.id);

      if (accessError) {
        console.error('Error fetching access grants:', accessError);
        throw accessError;
      }

      // Build access map from database
      const accessMap = (accessGrants || []).reduce((acc, grant) => {
        acc[grant.doctor_id] = grant.access_granted;
        return acc;
      }, {} as Record<string, boolean>);

      const accessList = (doctors as any[])?.map((doctor) => ({
        doctorId: doctor.doctor_id,
        doctorName: `Dr. ${doctor.first_name} ${doctor.last_name}`,
        specialty: doctor.specialty,
        hasAccess: accessMap[doctor.doctor_id] || false,
      })) || [];

      setDoctorAccess(accessList);
    } catch (error) {
      console.error('Error loading doctor access:', error);
      toast({
        title: "Error",
        description: "Failed to load doctors. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleDoctorAccess = async (doctorId: string) => {
    try {
      const currentAccess = doctorAccess.find(d => d.doctorId === doctorId);
      const newAccessState = !currentAccess?.hasAccess;

      // Upsert to database (server-side enforcement)
      const { error } = await supabase
        .from('doctor_patient_access')
        .upsert({
          patient_id: user?.id,
          doctor_id: doctorId,
          access_granted: newAccessState
        }, {
          onConflict: 'doctor_id,patient_id'
        });

      if (error) throw error;

      // Update local state only after successful database update
      const updatedAccess = doctorAccess.map(item =>
        item.doctorId === doctorId 
          ? { ...item, hasAccess: newAccessState }
          : item
      );

      setDoctorAccess(updatedAccess);

      const doctor = updatedAccess.find(d => d.doctorId === doctorId);
      toast({
        title: "Access Updated",
        description: `${doctor?.hasAccess ? 'Granted' : 'Revoked'} access to ${doctor?.doctorName}`,
      });
    } catch (error) {
      console.error('Error updating doctor access:', error);
      toast({
        title: "Error",
        description: "Failed to update doctor access",
        variant: "destructive",
      });
    }
  };

  return {
    doctorAccess,
    loading,
    toggleDoctorAccess,
    refetch: loadDoctorAccess
  };
};
