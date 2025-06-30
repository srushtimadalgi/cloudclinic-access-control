
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
      // Mock reports for now since types aren't updated
      const mockReports: MedicalReport[] = [
        {
          id: '1',
          title: 'Blood Test Results',
          file_url: '#',
          file_type: 'application/pdf',
          uploaded_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'X-Ray Report',
          file_url: '#',
          file_type: 'application/pdf',
          uploaded_at: new Date(Date.now() - 86400000).toISOString()
        }
      ];
      
      setReports(mockReports);
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
      // Mock upload for now
      const newReport: MedicalReport = {
        id: Date.now().toString(),
        title,
        file_url: '#',
        file_type: file.type,
        uploaded_at: new Date().toISOString()
      };

      setReports(prev => [newReport, ...prev]);

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
