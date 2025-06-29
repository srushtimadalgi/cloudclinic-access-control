
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Stethoscope } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const DoctorManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingDoctor, setIsAddingDoctor] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    licenseNumber: "",
    specialty: ""
  });

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

  const addDoctor = async () => {
    if (!newDoctor.firstName || !newDoctor.lastName || !newDoctor.email || 
        !newDoctor.password || !newDoctor.licenseNumber || !newDoctor.specialty) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newDoctor.email,
        password: newDoctor.password,
        options: {
          data: {
            first_name: newDoctor.firstName,
            last_name: newDoctor.lastName,
            role: 'doctor',
            license_number: newDoctor.licenseNumber,
            specialty: newDoctor.specialty,
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create doctor record
        const { error: doctorError } = await supabase
          .from('doctors')
          .insert({
            id: authData.user.id,
            license_number: newDoctor.licenseNumber,
            specialty: newDoctor.specialty,
          });

        if (doctorError) throw doctorError;

        toast({
          title: "Doctor Added",
          description: `Dr. ${newDoctor.firstName} ${newDoctor.lastName} has been added successfully`,
        });

        setNewDoctor({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          licenseNumber: "",
          specialty: ""
        });
        setIsAddingDoctor(false);
        queryClient.invalidateQueries({ queryKey: ['doctors'] });
      }
    } catch (error: any) {
      console.error('Error adding doctor:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add doctor",
        variant: "destructive",
      });
    }
  };

  const toggleDoctorVerification = async (doctorId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('doctors')
        .update({ verified: !currentStatus })
        .eq('id', doctorId);

      if (error) throw error;

      toast({
        title: "Doctor Status Updated",
        description: `Doctor verification status has been ${!currentStatus ? 'enabled' : 'disabled'}`,
      });

      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    } catch (error: any) {
      console.error('Error updating doctor:', error);
      toast({
        title: "Error",
        description: "Failed to update doctor status",
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
          <Dialog open={isAddingDoctor} onOpenChange={setIsAddingDoctor}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Doctor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Doctor</DialogTitle>
                <DialogDescription>
                  Create a new doctor account in the system
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={newDoctor.firstName}
                      onChange={(e) => setNewDoctor({...newDoctor, firstName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={newDoctor.lastName}
                      onChange={(e) => setNewDoctor({...newDoctor, lastName: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newDoctor.email}
                    onChange={(e) => setNewDoctor({...newDoctor, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newDoctor.password}
                    onChange={(e) => setNewDoctor({...newDoctor, password: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input
                    id="licenseNumber"
                    value={newDoctor.licenseNumber}
                    onChange={(e) => setNewDoctor({...newDoctor, licenseNumber: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="specialty">Specialty</Label>
                  <Select onValueChange={(value) => setNewDoctor({...newDoctor, specialty: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General Practitioner">General Practitioner</SelectItem>
                      <SelectItem value="Cardiologist">Cardiologist</SelectItem>
                      <SelectItem value="Dermatologist">Dermatologist</SelectItem>
                      <SelectItem value="Neurologist">Neurologist</SelectItem>
                      <SelectItem value="Orthopedic">Orthopedic</SelectItem>
                      <SelectItem value="Pediatrician">Pediatrician</SelectItem>
                      <SelectItem value="Psychiatrist">Psychiatrist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddingDoctor(false)}>
                  Cancel
                </Button>
                <Button onClick={addDoctor}>
                  Add Doctor
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
                <TableHead>Status</TableHead>
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleDoctorVerification(doctor.id, doctor.verified)}
                    >
                      {doctor.verified ? 'Unverify' : 'Verify'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default DoctorManagement;
