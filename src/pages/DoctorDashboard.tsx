
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import { 
  Users, 
  Calendar, 
  FileText, 
  Stethoscope,
  UserPlus,
  Edit,
  Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { usePrescriptions } from "@/hooks/usePrescriptions";
import { useAuth } from "@/contexts/AuthContext";

const DoctorDashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { prescriptions, createPrescription } = usePrescriptions();
  
  const [prescriptionDialog, setPrescriptionDialog] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: profile?.first_name || '',
    lastName: profile?.last_name || '',
    specialty: '',
    licenseNumber: ''
  });
  
  const [newPrescription, setNewPrescription] = useState({
    patient_id: '',
    medication: '',
    dosage: '',
    duration: '',
    instructions: ''
  });

  // Fetch all patients
  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'patient')
        .eq('status', 'active');

      if (error) throw error;
      return data;
    }
  });

  // Fetch doctor info
  const { data: doctorInfo } = useQuery({
    queryKey: ['doctor-info', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Fetch patients with granted access
  const { data: accessiblePatients } = useQuery({
    queryKey: ['accessible-patients'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('doctor_patient_access')
        .select(`
          *,
          patient:profiles!doctor_patient_access_patient_id_fkey(*)
        `);

      if (error) throw error;
      
      // Filter patients who have granted access to this doctor
      return data?.filter(access => 
        access.access_data && 
        Object.values(access.access_data).includes(user.id)
      ) || [];
    }
  });

  const handleCreatePrescription = async () => {
    if (!newPrescription.patient_id || !newPrescription.medication || !newPrescription.dosage || !newPrescription.duration) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    await createPrescription(newPrescription);
    setPrescriptionDialog(false);
    setNewPrescription({
      patient_id: '',
      medication: '',
      dosage: '',
      duration: '',
      instructions: ''
    });
  };

  const updateDoctorProfile = async () => {
    if (!user) return;

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update doctor info
      const { error: doctorError } = await supabase
        .from('doctors')
        .upsert({
          id: user.id,
          specialty: profileData.specialty,
          license_number: profileData.licenseNumber,
        });

      if (doctorError) throw doctorError;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      setEditingProfile(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-healthcare-gray">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-healthcare-text-primary">
            Doctor Dashboard
          </h1>
          <p className="text-healthcare-text-secondary mt-1">
            Welcome back, Dr. {profile?.first_name} {profile?.last_name}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-healthcare-text-secondary">Total Patients</p>
                  <p className="text-2xl font-bold text-healthcare-text-primary">
                    {accessiblePatients?.length || 0}
                  </p>
                </div>
                <Users className="h-8 w-8 text-healthcare-blue" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-healthcare-text-secondary">Prescriptions</p>
                  <p className="text-2xl font-bold text-healthcare-text-primary">
                    {prescriptions.filter(p => p.doctor_id === user?.id).length}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-healthcare-green" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-healthcare-text-secondary">Specialty</p>
                  <p className="text-lg font-bold text-healthcare-text-primary">
                    {doctorInfo?.specialty || 'Not Set'}
                  </p>
                </div>
                <Stethoscope className="h-8 w-8 text-healthcare-blue" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-healthcare-text-secondary">Status</p>
                  <Badge variant={doctorInfo?.verified ? "default" : "secondary"}>
                    {doctorInfo?.verified ? "Verified" : "Unverified"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="patients" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="patients">My Patients</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="all-patients">All Patients</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* My Patients Tab */}
          <TabsContent value="patients">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>My Patients</CardTitle>
                    <CardDescription>Patients who have granted you access to their records</CardDescription>
                  </div>
                  <Dialog open={prescriptionDialog} onOpenChange={setPrescriptionDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        New Prescription
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Prescription</DialogTitle>
                        <DialogDescription>
                          Create a prescription for your patient
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="patient">Select Patient</Label>
                          <Select onValueChange={(value) => setNewPrescription({...newPrescription, patient_id: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a patient" />
                            </SelectTrigger>
                            <SelectContent>
                              {accessiblePatients?.map((access) => (
                                <SelectItem key={access.patient_id} value={access.patient_id}>
                                  {access.patient.first_name} {access.patient.last_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="medication">Medication</Label>
                          <Input
                            id="medication"
                            value={newPrescription.medication}
                            onChange={(e) => setNewPrescription({...newPrescription, medication: e.target.value})}
                            placeholder="e.g., Amoxicillin 500mg"
                          />
                        </div>
                        <div>
                          <Label htmlFor="dosage">Dosage</Label>
                          <Input
                            id="dosage"
                            value={newPrescription.dosage}
                            onChange={(e) => setNewPrescription({...newPrescription, dosage: e.target.value})}
                            placeholder="e.g., 3 times daily"
                          />
                        </div>
                        <div>
                          <Label htmlFor="duration">Duration</Label>
                          <Input
                            id="duration"
                            value={newPrescription.duration}
                            onChange={(e) => setNewPrescription({...newPrescription, duration: e.target.value})}
                            placeholder="e.g., 7 days"
                          />
                        </div>
                        <div>
                          <Label htmlFor="instructions">Instructions (Optional)</Label>
                          <Textarea
                            id="instructions"
                            value={newPrescription.instructions}
                            onChange={(e) => setNewPrescription({...newPrescription, instructions: e.target.value})}
                            placeholder="Additional instructions for the patient"
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setPrescriptionDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleCreatePrescription}>
                            Create Prescription
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Access Granted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accessiblePatients?.map((access) => (
                      <TableRow key={access.patient_id}>
                        <TableCell className="font-medium">
                          {access.patient.first_name} {access.patient.last_name}
                        </TableCell>
                        <TableCell>{access.patient.email}</TableCell>
                        <TableCell>
                          <Badge variant={access.patient.status === 'active' ? 'default' : 'secondary'}>
                            {access.patient.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-500">Access Granted</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {accessiblePatients?.length === 0 && (
                  <p className="text-center text-healthcare-text-secondary py-8">
                    No patients have granted you access yet
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prescriptions Tab */}
          <TabsContent value="prescriptions">
            <Card>
              <CardHeader>
                <CardTitle>My Prescriptions</CardTitle>
                <CardDescription>Prescriptions you have created</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {prescriptions.filter(p => p.doctor_id === user?.id).map((prescription) => (
                    <div key={prescription.id} className="p-4 border border-healthcare-gray rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-healthcare-text-primary">
                          {prescription.medication}
                        </h4>
                        <Badge className={prescription.status === "active" ? "bg-healthcare-green" : "bg-gray-500"}>
                          {prescription.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-healthcare-text-secondary">
                        <strong>Patient:</strong> {prescription.patient_name}
                      </p>
                      <p className="text-sm text-healthcare-text-secondary">
                        <strong>Dosage:</strong> {prescription.dosage} • <strong>Duration:</strong> {prescription.duration}
                      </p>
                      {prescription.instructions && (
                        <p className="text-sm text-healthcare-text-secondary">
                          <strong>Instructions:</strong> {prescription.instructions}
                        </p>
                      )}
                      <p className="text-sm text-healthcare-text-secondary mt-2">
                        Prescribed on {new Date(prescription.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                  {prescriptions.filter(p => p.doctor_id === user?.id).length === 0 && (
                    <p className="text-center text-healthcare-text-secondary py-8">No prescriptions created yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Patients Tab */}
          <TabsContent value="all-patients">
            <Card>
              <CardHeader>
                <CardTitle>All Patients</CardTitle>
                <CardDescription>All patients in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {patients?.length === 0 && (
                  <p className="text-center text-healthcare-text-secondary py-8">No patients found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Doctor Profile</CardTitle>
                    <CardDescription>Manage your professional information</CardDescription>
                  </div>
                  <Button
                    variant={editingProfile ? "default" : "outline"}
                    onClick={() => {
                      if (editingProfile) {
                        updateDoctorProfile();
                      } else {
                        setProfileData({
                          firstName: profile?.first_name || '',
                          lastName: profile?.last_name || '',
                          specialty: doctorInfo?.specialty || '',
                          licenseNumber: doctorInfo?.license_number || ''
                        });
                        setEditingProfile(true);
                      }
                    }}
                  >
                    {editingProfile ? (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={editingProfile ? profileData.firstName : profile?.first_name || ''}
                      onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                      readOnly={!editingProfile}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={editingProfile ? profileData.lastName : profile?.last_name || ''}
                      onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                      readOnly={!editingProfile}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profile?.email || ''}
                    readOnly
                  />
                </div>
                <div>
                  <Label htmlFor="specialty">Specialty</Label>
                  <Input
                    id="specialty"
                    value={editingProfile ? profileData.specialty : doctorInfo?.specialty || ''}
                    onChange={(e) => setProfileData({...profileData, specialty: e.target.value})}
                    readOnly={!editingProfile}
                  />
                </div>
                <div>
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input
                    id="licenseNumber"
                    value={editingProfile ? profileData.licenseNumber : doctorInfo?.license_number || ''}
                    onChange={(e) => setProfileData({...profileData, licenseNumber: e.target.value})}
                    readOnly={!editingProfile}
                  />
                </div>
                <div>
                  <Label>Verification Status</Label>
                  <div className="mt-1">
                    <Badge variant={doctorInfo?.verified ? "default" : "secondary"}>
                      {doctorInfo?.verified ? "Verified" : "Unverified"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DoctorDashboard;
