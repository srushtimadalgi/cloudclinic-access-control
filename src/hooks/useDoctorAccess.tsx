
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface DoctorAccess {
  doctorId: string;
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
      // Get all doctors
      const { data: doctors, error: doctorsError } = await supabase
        .from('doctors')
        .select(`
          id,
          profiles!inner(first_name, last_name, role)
        `)
        .eq('profiles.role', 'doctor');

      if (doctorsError) throw doctorsError;

      // For now, we'll use localStorage to store access preferences
      // In a real app, you'd want a proper table for this
      const savedAccess = localStorage.getItem(`doctor-access-${user?.id}`);
      const accessData = savedAccess ? JSON.parse(savedAccess) : {};

      const accessList = doctors?.map(doctor => ({
        doctorId: doctor.id,
        hasAccess: accessData[doctor.id] || false
      })) || [];

      setDoctorAccess(accessList);
    } catch (error) {
      console.error('Error loading doctor access:', error);
      toast({
        title: "Error",
        description: "Failed to load doctor access settings",
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

      // Save to localStorage (in a real app, save to database)
      const accessData = updatedAccess.reduce((acc, item) => {
        acc[item.doctorId] = item.hasAccess;
        return acc;
      }, {} as Record<string, boolean>);

      localStorage.setItem(`doctor-access-${user?.id}`, JSON.stringify(accessData));

      toast({
        title: "Access Updated",
        description: "Doctor access permissions have been updated",
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
