
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Prescription {
  id: string;
  patient_id: string;
  doctor_id: string;
  medication: string;
  dosage: string;
  duration: string;
  instructions: string;
  status: string;
  created_at: string;
  patient_name?: string;
  doctor_name?: string;
}

export const usePrescriptions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPrescriptions();
    }
  }, [user]);

  const loadPrescriptions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select(`
          *,
          patient:profiles!prescriptions_patient_id_fkey(first_name, last_name),
          doctor:profiles!prescriptions_doctor_id_fkey(first_name, last_name)
        `)
        .or(`patient_id.eq.${user.id},doctor_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedPrescriptions = data?.map(p => ({
        ...p,
        patient_name: p.patient ? `${p.patient.first_name} ${p.patient.last_name}` : '',
        doctor_name: p.doctor ? `Dr. ${p.doctor.first_name} ${p.doctor.last_name}` : ''
      })) || [];

      setPrescriptions(formattedPrescriptions);
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      toast({
        title: "Error",
        description: "Failed to load prescriptions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPrescription = async (prescriptionData: {
    patient_id: string;
    medication: string;
    dosage: string;
    duration: string;
    instructions?: string;
  }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('prescriptions')
        .insert({
          ...prescriptionData,
          doctor_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Prescription created successfully",
      });

      await loadPrescriptions();
    } catch (error: any) {
      console.error('Error creating prescription:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create prescription",
        variant: "destructive",
      });
    }
  };

  return {
    prescriptions,
    loading,
    createPrescription,
    refetch: loadPrescriptions
  };
};
