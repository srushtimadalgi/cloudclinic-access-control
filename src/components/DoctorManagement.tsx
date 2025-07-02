
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Stethoscope } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const DoctorManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: doctors, isLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          id,
          license_number,
          specialty,
          verified,
          created_at,
          profiles!inner(first_name, last_name, email, status)
        `);

      if (error) throw error;
      return data;
    }
  });

  const toggleDoctorVerification = async (doctorId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('doctors')
        .update({ verified: !currentStatus })
        .eq('id', doctorId);

      if (error) throw error;

      toast({
        title: "Doctor Status Updated",
        description: `Doctor verification status has been ${!currentStatus ? 'verified' : 'unverified'}`,
      });

      // Refresh the data immediately
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    } catch (error: any) {
      console.error('Error updating doctor verification:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update doctor verification status",
        variant: "destructive",
      });
    }
  };

  const updateDoctorStatus = async (doctorId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', doctorId);

      if (error) throw error;

      toast({
        title: "Doctor Status Updated",
        description: `Doctor account has been ${newStatus === 'active' ? 'activated' : 'deactivated'}`,
      });

      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    } catch (error: any) {
      console.error('Error updating doctor status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update doctor status",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Stethoscope className="h-5 w-5 text-healthcare-blue" />
              <span>Doctor Management</span>
            </CardTitle>
            <CardDescription>
              Manage doctors in the system
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading doctors...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>License</TableHead>
                <TableHead>Account Status</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors?.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell className="font-medium">
                    Dr. {doctor.profiles.first_name} {doctor.profiles.last_name}
                  </TableCell>
                  <TableCell>{doctor.profiles.email}</TableCell>
                  <TableCell>{doctor.specialty}</TableCell>
                  <TableCell>{doctor.license_number}</TableCell>
                  <TableCell>
                    <Badge variant={doctor.profiles.status === 'active' ? 'default' : 'secondary'}>
                      {doctor.profiles.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={doctor.verified ? 'default' : 'destructive'}>
                      {doctor.verified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleDoctorVerification(doctor.id, doctor.verified)}
                      >
                        {doctor.verified ? 'Unverify' : 'Verify'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateDoctorStatus(doctor.id, doctor.profiles.status)}
                      >
                        {doctor.profiles.status === 'active' ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!doctors?.length && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-healthcare-text-secondary">
                    No doctors found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default DoctorManagement;
