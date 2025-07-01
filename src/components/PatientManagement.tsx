
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const PatientManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [newPatient, setNewPatient] = useState({
    firstName: "",
    lastName: "",
    email: "",
    joiningDate: "",
    patientRecord: ""
  });

  const { data: patients, isLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'patient')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const addPatient = async () => {
    if (!newPatient.firstName || !newPatient.lastName || !newPatient.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (Name and Email)",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create auth user without password - they'll need to reset password to access
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newPatient.email,
        email_confirm: true,
        user_metadata: {
          first_name: newPatient.firstName,
          last_name: newPatient.lastName,
          role: 'patient'
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create profile record
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            first_name: newPatient.firstName,
            last_name: newPatient.lastName,
            email: newPatient.email,
            role: 'patient',
            status: 'active'
          });

        if (profileError) throw profileError;

        toast({
          title: "Patient Added",
          description: `${newPatient.firstName} ${newPatient.lastName} has been added successfully. They will need to reset their password to access the system.`,
        });

        setNewPatient({
          firstName: "",
          lastName: "",
          email: "",
          joiningDate: "",
          patientRecord: ""
        });
        setIsAddingPatient(false);
        queryClient.invalidateQueries({ queryKey: ['patients'] });
      }
    } catch (error: any) {
      console.error('Error adding patient:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add patient",
        variant: "destructive",
      });
    }
  };

  const updatePatientStatus = async (patientId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', patientId);

      if (error) throw error;

      toast({
        title: "Patient Status Updated",
        description: `Patient account has been ${newStatus === 'active' ? 'activated' : 'deactivated'}`,
      });

      queryClient.invalidateQueries({ queryKey: ['patients'] });
    } catch (error: any) {
      console.error('Error updating patient status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update patient status",
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
              <Users className="h-5 w-5 text-healthcare-green" />
              <span>Patient Management</span>
            </CardTitle>
            <CardDescription>
              Manage patients in the system
            </CardDescription>
          </div>
          <Dialog open={isAddingPatient} onOpenChange={setIsAddingPatient}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Patient</DialogTitle>
                <DialogDescription>
                  Create a new patient record (no password required - they'll need to reset password to access)
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={newPatient.firstName}
                      onChange={(e) => setNewPatient({...newPatient, firstName: e.target.value})}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={newPatient.lastName}
                      onChange={(e) => setNewPatient({...newPatient, lastName: e.target.value})}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newPatient.email}
                    onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label htmlFor="joiningDate">Joining Date (Optional)</Label>
                  <Input
                    id="joiningDate"
                    type="date"
                    value={newPatient.joiningDate}
                    onChange={(e) => setNewPatient({...newPatient, joiningDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="patientRecord">Patient Record (Optional)</Label>
                  <Textarea
                    id="patientRecord"
                    value={newPatient.patientRecord}
                    onChange={(e) => setNewPatient({...newPatient, patientRecord: e.target.value})}
                    placeholder="Enter patient medical history or notes"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddingPatient(false)}>
                  Cancel
                </Button>
                <Button onClick={addPatient}>
                  Add Patient
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading patients...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients?.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">
                    {patient.first_name} {patient.last_name}
                  </TableCell>
                  <TableCell>{patient.email}</TableCell>
                  <TableCell>
                    <Badge variant={patient.status === 'active' ? 'default' : 'secondary'}>
                      {patient.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(patient.created_at || '').toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updatePatientStatus(patient.id, patient.status)}
                    >
                      {patient.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!patients?.length && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-healthcare-text-secondary">
                    No patients found
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

export default PatientManagement;
