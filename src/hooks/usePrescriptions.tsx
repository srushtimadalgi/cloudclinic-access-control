
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
        .select('*')
        .or(`patient_id.eq.${user.id},doctor_id.eq.${user.id}`);

      if (error) throw error;
      
      setPrescriptions(data || []);
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
      const { data, error } = await supabase
        .from('prescriptions')
        .insert({
          ...prescriptionData,
          doctor_id: user.id,
          instructions: prescriptionData.instructions || '',
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      setPrescriptions(prev => [data, ...prev]);

      toast({
        title: "Success",
        description: "Prescription created successfully",
      });
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
