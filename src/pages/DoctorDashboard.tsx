
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Navigation from "@/components/Navigation";
import { 
  Calendar as CalendarIcon, 
  User, 
  FileText, 
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Download,
  Stethoscope,
  Heart,
  Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

const DoctorDashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const [isAddingAppointment, setIsAddingAppointment] = useState(false);
  const [isAddingPrescription, setIsAddingPrescription] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    patientId: "",
    date: "",
    time: "",
    notes: ""
  });
  const [newPrescription, setNewPrescription] = useState({
    patientId: "",
    medication: "",
    dosage: "",
    duration: "",
    instructions: ""
  });

  // Fetch doctor's appointments
  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ['doctor-appointments', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          appointment_time,
          status,
          notes,
          patient_id,
          profiles!inner(first_name, last_name)
        `)
        .eq('doctor_id', user.id)
        .order('appointment_date', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Fetch doctor's prescriptions
  const { data: prescriptions = [], isLoading: prescriptionsLoading } = useQuery({
    queryKey: ['doctor-prescriptions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('prescriptions')
        .select(`
          id,
          medication,
          dosage,
          duration,
          instructions,
          status,
          created_at,
          patient_id,
          profiles!inner(first_name, last_name)
        `)
        .eq('doctor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Fetch patients
  const { data: patients = [], isLoading: patientsLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'patient')
        .eq('status', 'active')
        .order('first_name', { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  // Fetch medical reports that doctor has access to
  const { data: accessibleReports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ['accessible-reports', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('medical_reports')
        .select(`
          id,
          title,
          file_url,
          file_type,
          uploaded_at,
          patient_id,
          profiles!inner(first_name, last_name)
        `)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const createAppointment = async () => {
    if (!newAppointment.patientId || !newAppointment.date || !newAppointment.time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('appointments')
        .insert({
          patient_id: newAppointment.patientId,
          doctor_id: user?.id,
          appointment_date: newAppointment.date,
          appointment_time: newAppointment.time,
          notes: newAppointment.notes,
          status: 'confirmed'
        });

      if (error) throw error;

      setNewAppointment({ patientId: "", date: "", time: "", notes: "" });
      setIsAddingAppointment(false);
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] });

      toast({
        title: "Appointment Created",
        description: "The appointment has been scheduled successfully",
      });
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create appointment",
        variant: "destructive",
      });
    }
  };

  const createPrescription = async () => {
    if (!newPrescription.patientId || !newPrescription.medication || !newPrescription.dosage) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('prescriptions')
        .insert({
          patient_id: newPrescription.patientId,
          doctor_id: user?.id,
          medication: newPrescription.medication,
          dosage: newPrescription.dosage,
          duration: newPrescription.duration,
          instructions: newPrescription.instructions,
          status: 'active'
        });

      if (error) throw error;

      setNewPrescription({ patientId: "", medication: "", dosage: "", duration: "", instructions: "" });
      setIsAddingPrescription(false);
      queryClient.invalidateQueries({ queryKey: ['doctor-prescriptions'] });

      toast({
        title: "Prescription Created",
        description: "The prescription has been created and the patient will be notified",
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

  if (appointmentsLoading || prescriptionsLoading || patientsLoading) {
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
                  <p className="text-sm text-healthcare-text-secondary">Total Appointments</p>
                  <p className="text-2xl font-bold text-healthcare-text-primary">{appointments.length}</p>
                </div>
                <CalendarIcon className="h-8 w-8 text-healthcare-blue" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-healthcare-text-secondary">Active Prescriptions</p>
                  <p className="text-2xl font-bold text-healthcare-text-primary">
                    {prescriptions.filter(p => p.status === "active").length}
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
                  <p className="text-sm text-healthcare-text-secondary">Total Patients</p>
                  <p className="text-2xl font-bold text-healthcare-text-primary">{patients.length}</p>
                </div>
                <Users className="h-8 w-8 text-healthcare-blue" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-healthcare-text-secondary">Medical Reports</p>
                  <p className="text-2xl font-bold text-healthcare-text-primary">{accessibleReports.length}</p>
                </div>
                <Heart className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="reports">Medical Reports</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Appointments Tab */}
          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Appointments</CardTitle>
                    <CardDescription>Manage your appointments</CardDescription>
                  </div>
                  <Dialog open={isAddingAppointment} onOpenChange={setIsAddingAppointment}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Schedule Appointment
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Schedule New Appointment</DialogTitle>
                        <DialogDescription>
                          Create a new appointment with a patient
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div>
                          <Label htmlFor="patient">Patient *</Label>
                          <Select value={newAppointment.patientId} onValueChange={(value) => setNewAppointment({...newAppointment, patientId: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a patient" />
                            </SelectTrigger>
                            <SelectContent>
                              {patients.map(patient => (
                                <SelectItem key={patient.id} value={patient.id}>
                                  {patient.first_name} {patient.last_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="date">Date *</Label>
                          <Input
                            id="date"
                            type="date"
                            value={newAppointment.date}
                            onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="time">Time *</Label>
                          <Select value={newAppointment.time} onValueChange={(value) => setNewAppointment({...newAppointment, time: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="09:00:00">9:00 AM</SelectItem>
                              <SelectItem value="10:00:00">10:00 AM</SelectItem>
                              <SelectItem value="11:00:00">11:00 AM</SelectItem>
                              <SelectItem value="14:00:00">2:00 PM</SelectItem>
                              <SelectItem value="15:00:00">3:00 PM</SelectItem>
                              <SelectItem value="16:00:00">4:00 PM</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="notes">Notes</Label>
                          <Textarea
                            id="notes"
                            value={newAppointment.notes}
                            onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                            placeholder="Any additional notes..."
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsAddingAppointment(false)}>
                          Cancel
                        </Button>
                        <Button onClick={createAppointment}>
                          Schedule Appointment
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell className="font-medium">
                          {appointment.profiles.first_name} {appointment.profiles.last_name}
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
                      </TableRow>
                    ))}
                    {appointments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-healthcare-text-secondary">
                          No appointments found
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
                    <CardTitle>Prescriptions</CardTitle>
                    <CardDescription>Manage patient prescriptions</CardDescription>
                  </div>
                  <Dialog open={isAddingPrescription} onOpenChange={setIsAddingPrescription}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Prescription
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add New Prescription</DialogTitle>
                        <DialogDescription>
                          Create a new prescription for a patient
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div>
                          <Label htmlFor="patient">Patient *</Label>
                          <Select value={newPrescription.patientId} onValueChange={(value) => setNewPrescription({...newPrescription, patientId: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a patient" />
                            </SelectTrigger>
                            <SelectContent>
                              {patients.map(patient => (
                                <SelectItem key={patient.id} value={patient.id}>
                                  {patient.first_name} {patient.last_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="medication">Medication *</Label>
                          <Input
                            id="medication"
                            value={newPrescription.medication}
                            onChange={(e) => setNewPrescription({...newPrescription, medication: e.target.value})}
                            placeholder="Enter medication name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="dosage">Dosage *</Label>
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
                          <Label htmlFor="instructions">Instructions</Label>
                          <Textarea
                            id="instructions"
                            value={newPrescription.instructions}
                            onChange={(e) => setNewPrescription({...newPrescription, instructions: e.target.value})}
                            placeholder="Additional instructions for the patient"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsAddingPrescription(false)}>
                          Cancel
                        </Button>
                        <Button onClick={createPrescription}>
                          Add Prescription
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {prescriptions.map((prescription) => (
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
                        <strong>Patient:</strong> {prescription.profiles.first_name} {prescription.profiles.last_name}
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
                  {prescriptions.length === 0 && (
                    <p className="text-center text-healthcare-text-secondary py-8">No prescriptions found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients">
            <Card>
              <CardHeader>
                <CardTitle>Patients</CardTitle>
                <CardDescription>View all patients in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {patients.map((patient) => (
                    <Card key={patient.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3">
                          <div className="bg-healthcare-blue p-3 rounded-full">
                            <User className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-healthcare-text-primary">
                              {patient.first_name} {patient.last_name}
                            </h3>
                            <p className="text-sm text-healthcare-text-secondary">{patient.email}</p>
                            <Badge variant={patient.status === "active" ? "default" : "secondary"} className="mt-1">
                              {patient.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {patients.length === 0 && (
                  <p className="text-center text-healthcare-text-secondary py-8">No patients found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medical Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Medical Reports</CardTitle>
                <CardDescription>Access patient medical reports (requires patient permission)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {accessibleReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border border-healthcare-gray rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-8 w-8 text-healthcare-blue" />
                        <div>
                          <h4 className="font-medium text-healthcare-text-primary">{report.title}</h4>
                          <p className="text-sm text-healthcare-text-secondary">
                            Patient: {report.profiles.first_name} {report.profiles.last_name}
                          </p>
                          <p className="text-sm text-healthcare-text-secondary">
                            {report.file_type} • {new Date(report.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={report.file_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          View
                        </a>
                      </Button>
                    </div>
                  ))}
                  {accessibleReports.length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-healthcare-text-secondary mx-auto mb-4" />
                      <p className="text-healthcare-text-secondary">No accessible medical reports found</p>
                      <p className="text-sm text-healthcare-text-secondary mt-2">
                        Patients need to grant you access to view their medical reports
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Doctor Profile</CardTitle>
                <CardDescription>Your profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profile?.first_name || ''}
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profile?.last_name || ''}
                      readOnly
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
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={profile?.role || ''}
                    readOnly
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Input
                    id="status"
                    value={profile?.status || ''}
                    readOnly
                  />
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
