
import { useState, useEffect } from 'react';
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
      // Mock prescriptions for now since types aren't updated
      const mockPrescriptions: Prescription[] = [
        {
          id: '1',
          patient_id: user.id,
          doctor_id: 'doc-1',
          medication: 'Amoxicillin',
          dosage: '500mg',
          duration: '7 days',
          instructions: 'Take with food',
          status: 'active',
          created_at: new Date().toISOString(),
          doctor_name: 'Dr. Sarah Smith'
        },
        {
          id: '2',
          patient_id: user.id,
          doctor_id: 'doc-2',
          medication: 'Ibuprofen',
          dosage: '200mg',
          duration: '5 days',
          instructions: 'Take as needed for pain',
          status: 'active',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          doctor_name: 'Dr. John Doe'
        }
      ];
      
      setPrescriptions(mockPrescriptions);
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
      const newPrescription: Prescription = {
        id: Date.now().toString(),
        ...prescriptionData,
        doctor_id: user.id,
        status: 'active',
        created_at: new Date().toISOString(),
        doctor_name: 'Current Doctor'
      };

      setPrescriptions(prev => [newPrescription, ...prev]);

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
