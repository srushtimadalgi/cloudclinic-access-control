
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MedicalReport {
  id: string;
  title: string;
  file_url: string;
  file_type: string;
  uploaded_at: string;
}

export const useMedicalReports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      loadReports();
    }
  }, [user]);

  const loadReports = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('medical_reports')
        .select('*')
        .eq('patient_id', user.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      
      setReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast({
        title: "Error",
        description: "Failed to load medical reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadReport = async (file: File, title: string) => {
    if (!user) return;

    setUploading(true);
    try {
      const { data, error } = await supabase
        .from('medical_reports')
        .insert({
          patient_id: user.id,
          title,
          file_url: '#', // Placeholder for now
          file_type: file.type
        })
        .select()
        .single();

      if (error) throw error;

      setReports(prev => [data, ...prev]);

      toast({
        title: "Success",
        description: "Medical report uploaded successfully",
      });
    } catch (error: any) {
      console.error('Error uploading report:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload report",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return {
    reports,
    loading,
    uploading,
    uploadReport,
    refetch: loadReports
  };
};
