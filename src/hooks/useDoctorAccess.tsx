
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
      // Get all verified doctors from the database
      const { data: doctors, error: doctorsError } = await supabase
        .from('doctors')
        .select(`
          id,
          specialty,
          verified,
          profiles!inner(first_name, last_name, role, status)
        `)
        .eq('profiles.role', 'doctor')
        .eq('profiles.status', 'active')
        .eq('verified', true);

      if (doctorsError) {
        console.error('Error fetching doctors:', doctorsError);
        throw doctorsError;
      }

      // Get saved access preferences from localStorage
      const savedAccess = localStorage.getItem(`doctor-access-${user?.id}`);
      const accessData = savedAccess ? JSON.parse(savedAccess) : {};

      const accessList = doctors?.map(doctor => ({
        doctorId: doctor.id,
        doctorName: `Dr. ${doctor.profiles.first_name} ${doctor.profiles.last_name}`,
        specialty: doctor.specialty,
        hasAccess: accessData[doctor.id] || false
      })) || [];

      setDoctorAccess(accessList);
      console.log('Doctor access loaded:', accessList);
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
      const updatedAccess = doctorAccess.map(item =>
        item.doctorId === doctorId 
          ? { ...item, hasAccess: !item.hasAccess }
          : item
      );

      setDoctorAccess(updatedAccess);

      // Save to localStorage
      const accessData = updatedAccess.reduce((acc, item) => {
        acc[item.doctorId] = item.hasAccess;
        return acc;
      }, {} as Record<string, boolean>);

      localStorage.setItem(`doctor-access-${user?.id}`, JSON.stringify(accessData));

      const doctor = updatedAccess.find(d => d.doctorId === doctorId);
      toast({
        title: "Access Updated",
        description: `${doctor?.hasAccess ? 'Granted' : 'Revoked'} access to ${doctor?.doctorName}`,
      });

      console.log('Doctor access updated:', updatedAccess);
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
