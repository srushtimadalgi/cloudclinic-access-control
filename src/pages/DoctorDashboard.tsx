
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import PatientManagement from "@/components/PatientManagement";
import { 
  Calendar as CalendarIcon, 
  Users, 
  FileText, 
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Stethoscope
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { useAppointments } from "@/hooks/useAppointments";

const DoctorDashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const { appointments, loading: appointmentsLoading, updateAppointmentStatus, getWeeklyAppointments } = useAppointments();

  const [newPrescription, setNewPrescription] = useState({
    patientId: "",
    medication: "",
    dosage: "",
    duration: "",
    instructions: ""
  });
  const [isPrescriptionDialogOpen, setIsPrescriptionDialogOpen] = useState(false);

  // Get weekly appointments for the doctor
  const weeklyAppointments = getWeeklyAppointments().filter(apt => apt.doctor_id === user?.id);

  // Fetch all patients for prescription dropdown
  const { data: patients } = useQuery({
    queryKey: ['all-patients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('role', 'patient')
        .eq('status', 'active');

      if (error) throw error;
      return data;
    }
  });

  const createPrescription = async () => {
    if (!newPrescription.patientId || !newPrescription.medication || 
        !newPrescription.dosage || !newPrescription.duration) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create prescriptions",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('prescriptions')
        .insert({
          patient_id: newPrescription.patientId,
          doctor_id: user.id,
          medication: newPrescription.medication,
          dosage: newPrescription.dosage,
          duration: newPrescription.duration,
          instructions: newPrescription.instructions,
          status: 'active'
        });

      if (error) throw error;

      toast({
        title: "Prescription Created",
        description: "Prescription has been created successfully",
      });

      setNewPrescription({
        patientId: "",
        medication: "",
        dosage: "",
        duration: "",
        instructions: ""
      });
      setIsPrescriptionDialogOpen(false);
    } catch (error: any) {
      console.error('Error creating prescription:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create prescription",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-500";
      case "pending": return "bg-yellow-500";
      case "cancelled": return "bg-red-500";
      case "completed": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed": return <CheckCircle className="h-4 w-4" />;
      case "pending": return <Clock className="h-4 w-4" />;
      case "cancelled": return <XCircle className="h-4 w-4" />;
      case "completed": return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (appointmentsLoading) {
    return (
      <div className="min-h-screen bg-healthcare-gray flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-healthcare-blue mx-auto mb-4"></div>
          <p className="text-healthcare-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-healthcare-gray">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-healthcare-text-primary">
                Doctor Dashboard
              </h1>
              <p className="text-healthcare-text-secondary mt-1">
                Welcome back, Dr. {profile?.first_name} {profile?.last_name}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-2">
                <Stethoscope className="h-5 w-5 text-healthcare-blue" />
                <span className="text-sm font-medium">Doctor Portal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-healthcare-text-secondary">This Week</p>
                  <p className="text-2xl font-bold text-healthcare-text-primary">
                    {weeklyAppointments.length}
                  </p>
                </div>
                <CalendarIcon className="h-8 w-8 text-healthcare-blue" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-healthcare-text-secondary">Pending</p>
                  <p className="text-2xl font-bold text-healthcare-text-primary">
                    {appointments.filter(apt => apt.status === "pending").length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-healthcare-blue" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-healthcare-text-secondary">Confirmed</p>
                  <p className="text-2xl font-bold text-healthcare-text-primary">
                    {appointments.filter(apt => apt.status === "confirmed").length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-healthcare-green" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-healthcare-text-secondary">Total Patients</p>
                  <p className="text-2xl font-bold text-healthcare-text-primary">
                    {patients?.length || 0}
                  </p>
                </div>
                <Users className="h-8 w-8 text-healthcare-blue" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Tabs */}
        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
          </TabsList>

          {/* Appointments Tab */}
          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CalendarIcon className="h-5 w-5 text-healthcare-blue" />
                  <span>Weekly Appointments</span>
                </CardTitle>
                <CardDescription>
                  Manage your appointments for this week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {weeklyAppointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell className="font-medium">
                          {appointment.patient_name || "Patient"}
                        </TableCell>
                        <TableCell>{new Date(appointment.appointment_date).toLocaleDateString()}</TableCell>
                        <TableCell>{appointment.appointment_time}</TableCell>
                        <TableCell>{appointment.notes}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(appointment.status)}
                            <Badge className={getStatusColor(appointment.status)}>
                              {appointment.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {appointment.status === "pending" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateAppointmentStatus(appointment.id, "confirmed")}
                                >
                                  Confirm
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateAppointmentStatus(appointment.id, "cancelled")}
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                            {appointment.status === "confirmed" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateAppointmentStatus(appointment.id, "completed")}
                              >
                                Complete
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {weeklyAppointments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-healthcare-text-secondary">
                          No appointments scheduled for this week
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prescriptions Tab */}
          <TabsContent value="prescriptions">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-healthcare-blue" />
                      <span>Prescriptions</span>
                    </CardTitle>
                    <CardDescription>
                      Create and manage patient prescriptions
                    </CardDescription>
                  </div>
                  <Dialog open={isPrescriptionDialogOpen} onOpenChange={setIsPrescriptionDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Prescription
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Create Prescription</DialogTitle>
                        <DialogDescription>
                          Create a new prescription for a patient
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div>
                          <Label htmlFor="patient">Patient</Label>
                          <Select onValueChange={(value) => setNewPrescription({...newPrescription, patientId: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select patient" />
                            </SelectTrigger>
                            <SelectContent>
                              {patients?.map(patient => (
                                <SelectItem key={patient.id} value={patient.id}>
                                  {patient.first_name} {patient.last_name} - {patient.email}
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
                            placeholder="e.g., Amoxicillin"
                          />
                        </div>
                        <div>
                          <Label htmlFor="dosage">Dosage</Label>
                          <Input
                            id="dosage"
                            value={newPrescription.dosage}
                            onChange={(e) => setNewPrescription({...newPrescription, dosage: e.target.value})}
                            placeholder="e.g., 500mg twice daily"
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
                          <Input
                            id="instructions"
                            value={newPrescription.instructions}
                            onChange={(e) => setNewPrescription({...newPrescription, instructions: e.target.value})}
                            placeholder="e.g., Take with food"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsPrescriptionDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={createPrescription}>
                          Create Prescription
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-healthcare-text-secondary">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-healthcare-text-secondary" />
                  <p>Prescription management will be displayed here</p>
                  <p className="text-sm">Use the "New Prescription" button to create prescriptions</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients">
            <PatientManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DoctorDashboard;
