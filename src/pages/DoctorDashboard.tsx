import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Navigation from "@/components/Navigation";
import { 
  Calendar as CalendarIcon, 
  Users, 
  FileText, 
  Search, 
  User,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DoctorDashboard = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Mock appointments data with management capabilities
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      patientName: "John Doe",
      patientEmail: "john.doe@email.com",
      date: "2024-01-20",
      time: "10:00 AM",
      status: "pending",
      reason: "Regular checkup",
      notes: ""
    },
    {
      id: 2,
      patientName: "Jane Smith",
      patientEmail: "jane.smith@email.com",
      date: "2024-01-22",
      time: "2:30 PM",
      status: "approved",
      reason: "Follow-up consultation",
      notes: "Patient recovering well"
    },
    {
      id: 3,
      patientName: "Bob Johnson",
      patientEmail: "bob.johnson@email.com",
      date: "2024-01-25",
      time: "11:15 AM",
      status: "pending",
      reason: "Initial consultation",
      notes: ""
    }
  ]);

  const [patients] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@email.com",
      phone: "+1 (555) 123-4567",
      dateOfBirth: "1985-03-15",
      bloodType: "O+",
      allergies: "Penicillin",
      hasAccess: true,
      lastVisit: "2024-01-15"
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@email.com",
      phone: "+1 (555) 987-6543",
      dateOfBirth: "1990-07-22",
      bloodType: "A-",
      allergies: "None",
      hasAccess: true,
      lastVisit: "2024-01-10"
    }
  ]);

  const [prescriptions, setPrescriptions] = useState([
    {
      id: 1,
      patientName: "John Doe",
      medication: "Amoxicillin 500mg",
      dosage: "3 times daily",
      duration: "7 days",
      date: "2024-01-15",
      status: "active"
    }
  ]);

  const [newPrescription, setNewPrescription] = useState({
    patientId: "",
    medication: "",
    dosage: "",
    duration: "",
    instructions: ""
  });

  const updateAppointmentStatus = (appointmentId: number, newStatus: string) => {
    setAppointments(appointments.map(apt => 
      apt.id === appointmentId 
        ? { ...apt, status: newStatus }
        : apt
    ));
    toast({
      title: "Appointment Updated",
      description: `Appointment has been ${newStatus}`,
    });
  };

  const rescheduleAppointment = (appointmentId: number) => {
    // In a real app, this would open a modal or form for rescheduling
    toast({
      title: "Reschedule Request",
      description: "Rescheduling functionality would be implemented here",
    });
  };

  const addPrescription = () => {
    if (!newPrescription.patientId || !newPrescription.medication) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const patient = patients.find(p => p.id.toString() === newPrescription.patientId);
    if (!patient?.hasAccess) {
      toast({
        title: "Access Denied",
        description: "Patient has not granted you access to their medical records",
        variant: "destructive",
      });
      return;
    }

    const prescription = {
      id: prescriptions.length + 1,
      patientName: patient.name,
      medication: newPrescription.medication,
      dosage: newPrescription.dosage,
      duration: newPrescription.duration,
      date: new Date().toISOString().split('T')[0],
      status: "active"
    };

    setPrescriptions([...prescriptions, prescription]);
    setNewPrescription({
      patientId: "",
      medication: "",
      dosage: "",
      duration: "",
      instructions: ""
    });

    toast({
      title: "Prescription Added",
      description: "Prescription has been successfully added to patient's records",
    });
  };

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-500";
      case "pending": return "bg-yellow-500";
      case "canceled": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const stats = {
    totalPatients: patients.length,
    todayAppointments: appointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]).length,
    pendingAppointments: appointments.filter(apt => apt.status === "pending").length,
    activePrescriptions: prescriptions.filter(p => p.status === "active").length
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
            Welcome back, Dr. Sarah Smith
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-healthcare-text-secondary">Total Patients</p>
                  <p className="text-2xl font-bold text-healthcare-text-primary">{stats.totalPatients}</p>
                </div>
                <Users className="h-8 w-8 text-healthcare-blue" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-healthcare-text-secondary">Today's Appointments</p>
                  <p className="text-2xl font-bold text-healthcare-text-primary">{stats.todayAppointments}</p>
                </div>
                <CalendarIcon className="h-8 w-8 text-healthcare-green" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-healthcare-text-secondary">Pending Approvals</p>
                  <p className="text-2xl font-bold text-healthcare-text-primary">{stats.pendingAppointments}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-healthcare-text-secondary">Active Prescriptions</p>
                  <p className="text-2xl font-bold text-healthcare-text-primary">{stats.activePrescriptions}</p>
                </div>
                <FileText className="h-8 w-8 text-healthcare-blue" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          </TabsList>

          {/* Appointments Tab */}
          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Management</CardTitle>
                <CardDescription>
                  Manage your appointments - approve, reschedule, or cancel
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
                    {appointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell className="font-medium">{appointment.patientName}</TableCell>
                        <TableCell>{appointment.date}</TableCell>
                        <TableCell>{appointment.time}</TableCell>
                        <TableCell>{appointment.reason}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {appointment.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => updateAppointmentStatus(appointment.id, "approved")}
                                  className="bg-green-500 hover:bg-green-600"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => updateAppointmentStatus(appointment.id, "canceled")}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Cancel
                                </Button>
                              </>
                            )}
                            {appointment.status === "approved" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => rescheduleAppointment(appointment.id)}
                                >
                                  <Clock className="h-4 w-4 mr-1" />
                                  Reschedule
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => updateAppointmentStatus(appointment.id, "canceled")}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Cancel
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients">
            <Card>
              <CardHeader>
                <CardTitle>Patient Records</CardTitle>
                <CardDescription>
                  Access patient information (only those who granted you access)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-healthcare-text-secondary h-4 w-4" />
                    <Input
                      placeholder="Search patients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className={`p-4 border rounded-lg ${
                        patient.hasAccess ? 'border-healthcare-blue bg-healthcare-blue-light' : 'border-red-300 bg-red-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-white rounded-full p-2">
                            <User className="h-6 w-6 text-healthcare-blue" />
                          </div>
                          <div>
                            <h4 className="font-medium text-healthcare-text-primary">
                              {patient.name}
                            </h4>
                            <p className="text-sm text-healthcare-text-secondary">
                              {patient.email} • Last visit: {patient.lastVisit}
                            </p>
                            {patient.hasAccess && (
                              <p className="text-sm text-healthcare-text-secondary">
                                Blood Type: {patient.bloodType} • Allergies: {patient.allergies}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={patient.hasAccess ? "default" : "secondary"}
                            className={patient.hasAccess ? "bg-healthcare-green" : "bg-red-500"}
                          >
                            {patient.hasAccess ? "Access Granted" : "Access Denied"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prescriptions Tab */}
          <TabsContent value="prescriptions">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add Prescription */}
              <Card>
                <CardHeader>
                  <CardTitle>Add New Prescription</CardTitle>
                  <CardDescription>
                    Create a prescription for your patients
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Patient</label>
                    <select
                      value={newPrescription.patientId}
                      onChange={(e) => setNewPrescription({...newPrescription, patientId: e.target.value})}
                      className="w-full mt-1 p-2 border border-healthcare-gray rounded-md"
                    >
                      <option value="">Select a patient</option>
                      {patients.filter(p => p.hasAccess).map(patient => (
                        <option key={patient.id} value={patient.id}>{patient.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Medication</label>
                    <Input
                      value={newPrescription.medication}
                      onChange={(e) => setNewPrescription({...newPrescription, medication: e.target.value})}
                      placeholder="e.g., Amoxicillin 500mg"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Dosage</label>
                    <Input
                      value={newPrescription.dosage}
                      onChange={(e) => setNewPrescription({...newPrescription, dosage: e.target.value})}
                      placeholder="e.g., 3 times daily"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Duration</label>
                    <Input
                      value={newPrescription.duration}
                      onChange={(e) => setNewPrescription({...newPrescription, duration: e.target.value})}
                      placeholder="e.g., 7 days"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Instructions</label>
                    <Textarea
                      value={newPrescription.instructions}
                      onChange={(e) => setNewPrescription({...newPrescription, instructions: e.target.value})}
                      placeholder="Additional instructions..."
                    />
                  </div>
                  <Button onClick={addPrescription} className="w-full">
                    Add Prescription
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Prescriptions */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Prescriptions</CardTitle>
                  <CardDescription>
                    Your recently added prescriptions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {prescriptions.map((prescription) => (
                      <div
                        key={prescription.id}
                        className="p-4 border border-healthcare-gray rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-healthcare-text-primary">
                              {prescription.patientName}
                            </h4>
                            <p className="text-sm text-healthcare-text-secondary">
                              {prescription.medication} - {prescription.dosage}
                            </p>
                            <p className="text-sm text-healthcare-text-secondary">
                              Duration: {prescription.duration} • Date: {prescription.date}
                            </p>
                          </div>
                          <Badge className="bg-healthcare-green">
                            {prescription.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DoctorDashboard;
