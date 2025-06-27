
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import {
  Calendar,
  Clock,
  FileText,
  Users,
  Stethoscope,
  Plus,
  Eye,
  Upload,
  Search,
  Edit,
  Check,
  X,
  AlertCircle,
} from "lucide-react";

const DoctorDashboard = () => {
  const { toast } = useToast();
  
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      patient: "John Doe",
      patientId: "P001",
      time: "10:00 AM",
      type: "Follow-up",
      status: "confirmed",
      hasAccess: true,
      notes: "Regular checkup for hypertension management",
    },
    {
      id: 2,
      patient: "Jane Smith",
      patientId: "P002",
      time: "11:30 AM",
      type: "Consultation",
      status: "confirmed",
      hasAccess: false,
      notes: "Initial consultation for chest pain",
    },
    {
      id: 3,
      patient: "Robert Johnson",
      patientId: "P003",
      time: "2:00 PM",
      type: "Check-up",
      status: "pending",
      hasAccess: true,
      notes: "Diabetes management follow-up",
    },
  ]);

  const [patientRecords, setPatientRecords] = useState([
    {
      id: 1,
      patientId: "P001",
      name: "John Doe",
      lastVisit: "2024-01-10",
      condition: "Hypertension",
      hasAccess: true,
      age: 45,
      bloodType: "O+",
      allergies: "None known",
      currentMedications: ["Lisinopril 10mg"],
    },
    {
      id: 2,
      patientId: "P003",
      name: "Robert Johnson",
      lastVisit: "2024-01-08",
      condition: "Diabetes Type 2",
      hasAccess: true,
      age: 52,
      bloodType: "A+",
      allergies: "Penicillin",
      currentMedications: ["Metformin 500mg", "Insulin"],
    },
  ]);

  const [prescriptions, setPrescriptions] = useState([
    {
      id: 1,
      patientId: "P001",
      patient: "John Doe",
      medication: "Lisinopril 10mg",
      dosage: "Once daily",
      instructions: "Take with food in the morning",
      status: "active",
      date: "2024-01-12",
      duration: "30 days",
    },
    {
      id: 2,
      patientId: "P003",
      patient: "Robert Johnson",
      medication: "Metformin 500mg",
      dosage: "Twice daily",
      instructions: "Take before meals",
      status: "active",
      date: "2024-01-11",
      duration: "90 days",
    },
  ]);

  const [prescriptionForm, setPrescriptionForm] = useState({
    patientId: "",
    medication: "",
    dosage: "",
    instructions: "",
    duration: "",
  });

  const [appointmentNotes, setAppointmentNotes] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const filteredPatients = patientRecords.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.patientId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const todaysStats = {
    totalAppointments: appointments.length,
    confirmedAppointments: appointments.filter(apt => apt.status === "confirmed").length,
    pendingAppointments: appointments.filter(apt => apt.status === "pending").length,
    accessibleRecords: patientRecords.length,
    activePrescriptions: prescriptions.filter(p => p.status === "active").length,
  };

  const handleCreatePrescription = () => {
    if (!prescriptionForm.patientId || !prescriptionForm.medication || !prescriptionForm.dosage) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const patient = patientRecords.find(p => p.patientId === prescriptionForm.patientId);
    if (!patient) {
      toast({
        title: "Patient Not Found",
        description: "Selected patient not found or no access granted.",
        variant: "destructive",
      });
      return;
    }

    const newPrescription = {
      id: prescriptions.length + 1,
      patientId: prescriptionForm.patientId,
      patient: patient.name,
      medication: prescriptionForm.medication,
      dosage: prescriptionForm.dosage,
      instructions: prescriptionForm.instructions,
      duration: prescriptionForm.duration,
      status: "active",
      date: new Date().toISOString().split('T')[0],
    };

    setPrescriptions([...prescriptions, newPrescription]);
    setPrescriptionForm({
      patientId: "",
      medication: "",
      dosage: "",
      instructions: "",
      duration: "",
    });
    setShowPrescriptionForm(false);

    toast({
      title: "Prescription Created",
      description: `Prescription for ${patient.name} has been created successfully.`,
    });
  };

  const handleAppointmentStatusUpdate = (appointmentId: number, newStatus: string) => {
    setAppointments(appointments.map(apt =>
      apt.id === appointmentId ? { ...apt, status: newStatus } : apt
    ));

    toast({
      title: "Appointment Updated",
      description: `Appointment status changed to ${newStatus}.`,
    });
  };

  const handleAddAppointmentNotes = (appointmentId: number, notes: string) => {
    setAppointmentNotes({ ...appointmentNotes, [appointmentId]: notes });
    toast({
      title: "Notes Saved",
      description: "Appointment notes have been saved.",
    });
  };

  const handleViewPatientDetails = (patient: any) => {
    setSelectedPatient(patient);
    setShowPatientDetails(true);
  };

  const handleRevokePrescription = (prescriptionId: number) => {
    setPrescriptions(prescriptions.map(p =>
      p.id === prescriptionId ? { ...p, status: "revoked" } : p
    ));

    toast({
      title: "Prescription Revoked",
      description: "Prescription has been revoked successfully.",
    });
  };

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
                Welcome back, Dr. Sarah Smith - Cardiology
              </p>
            </div>
            <Dialog open={showPrescriptionForm} onOpenChange={setShowPrescriptionForm}>
              <DialogTrigger asChild>
                <Button className="bg-healthcare-green hover:bg-healthcare-green/90">
                  <Plus className="h-4 w-4 mr-2" />
                  New Prescription
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Prescription</DialogTitle>
                  <DialogDescription>
                    Create a new prescription for an authorized patient.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient-select">Patient</Label>
                    <Select
                      value={prescriptionForm.patientId}
                      onValueChange={(value) => setPrescriptionForm({...prescriptionForm, patientId: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient..." />
                      </SelectTrigger>
                      <SelectContent>
                        {patientRecords.map((patient) => (
                          <SelectItem key={patient.patientId} value={patient.patientId}>
                            {patient.name} ({patient.patientId})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medication">Medication</Label>
                    <Input
                      id="medication"
                      value={prescriptionForm.medication}
                      onChange={(e) => setPrescriptionForm({...prescriptionForm, medication: e.target.value})}
                      placeholder="e.g., Lisinopril 10mg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dosage">Dosage</Label>
                    <Input
                      id="dosage"
                      value={prescriptionForm.dosage}
                      onChange={(e) => setPrescriptionForm({...prescriptionForm, dosage: e.target.value})}
                      placeholder="e.g., Once daily"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={prescriptionForm.duration}
                      onChange={(e) => setPrescriptionForm({...prescriptionForm, duration: e.target.value})}
                      placeholder="e.g., 30 days"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instructions">Instructions</Label>
                    <Textarea
                      id="instructions"
                      value={prescriptionForm.instructions}
                      onChange={(e) => setPrescriptionForm({...prescriptionForm, instructions: e.target.value})}
                      placeholder="Special instructions and notes..."
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowPrescriptionForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePrescription}>
                    Create Prescription
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-healthcare-blue" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-healthcare-text-secondary">Today's Appointments</p>
                  <p className="text-2xl font-bold text-healthcare-text-primary">{todaysStats.totalAppointments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Check className="h-8 w-8 text-healthcare-green" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-healthcare-text-secondary">Confirmed</p>
                  <p className="text-2xl font-bold text-healthcare-green">{todaysStats.confirmedAppointments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-healthcare-text-secondary">Pending</p>
                  <p className="text-2xl font-bold text-yellow-500">{todaysStats.pendingAppointments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-healthcare-blue" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-healthcare-text-secondary">Accessible Records</p>
                  <p className="text-2xl font-bold text-healthcare-blue">{todaysStats.accessibleRecords}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Stethoscope className="h-8 w-8 text-healthcare-green" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-healthcare-text-secondary">Active Prescriptions</p>
                  <p className="text-2xl font-bold text-healthcare-green">{todaysStats.activePrescriptions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="appointments">Today's Appointments</TabsTrigger>
            <TabsTrigger value="patients">Patient Records</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-healthcare-blue" />
                  <span>Today's Appointments</span>
                </CardTitle>
                <CardDescription>
                  Manage your appointments for today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Access</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell className="font-medium">
                          <div>
                            <p>{appointment.patient}</p>
                            <p className="text-sm text-healthcare-text-secondary">ID: {appointment.patientId}</p>
                          </div>
                        </TableCell>
                        <TableCell>{appointment.time}</TableCell>
                        <TableCell>{appointment.type}</TableCell>
                        <TableCell>
                          {appointment.hasAccess ? (
                            <Badge className="bg-healthcare-green">Has Access</Badge>
                          ) : (
                            <Badge variant="secondary">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              No Access
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={appointment.status === "confirmed" ? "default" : "secondary"}
                            className={appointment.status === "confirmed" ? "bg-healthcare-blue" : "bg-yellow-500"}
                          >
                            {appointment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {appointment.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleAppointmentStatusUpdate(appointment.id, "confirmed")}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Confirm
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAppointmentStatusUpdate(appointment.id, "cancelled")}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Cancel
                                </Button>
                              </>
                            )}
                            {appointment.hasAccess && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewPatientDetails(
                                  patientRecords.find(p => p.patientId === appointment.patientId)
                                )}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View Records
                              </Button>
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

          <TabsContent value="patients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-healthcare-blue" />
                  <span>Patient Records</span>
                </CardTitle>
                <CardDescription>
                  Patients who have granted you access to their records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-healthcare-text-secondary h-4 w-4" />
                    <Input
                      placeholder="Search patient records..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Last Visit</TableHead>
                      <TableHead>Primary Condition</TableHead>
                      <TableHead>Blood Type</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">
                          <div>
                            <p>{patient.name}</p>
                            <p className="text-sm text-healthcare-text-secondary">
                              ID: {patient.patientId} • Age: {patient.age}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{patient.lastVisit}</TableCell>
                        <TableCell>{patient.condition}</TableCell>
                        <TableCell>{patient.bloodType}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewPatientDetails(patient)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prescriptions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Stethoscope className="h-5 w-5 text-healthcare-green" />
                  <span>Prescription Management</span>
                </CardTitle>
                <CardDescription>
                  Manage and track patient prescriptions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Medication</TableHead>
                      <TableHead>Dosage</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prescriptions.map((prescription) => (
                      <TableRow key={prescription.id}>
                        <TableCell className="font-medium">
                          <div>
                            <p>{prescription.patient}</p>
                            <p className="text-sm text-healthcare-text-secondary">
                              ID: {prescription.patientId}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{prescription.medication}</TableCell>
                        <TableCell>{prescription.dosage}</TableCell>
                        <TableCell>{prescription.duration}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              prescription.status === "active"
                                ? "bg-healthcare-green"
                                : prescription.status === "revoked"
                                ? "bg-red-500"
                                : "bg-gray-500"
                            }
                          >
                            {prescription.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {prescription.status === "active" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRevokePrescription(prescription.id)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Revoke
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Schedule Overview</CardTitle>
                <CardDescription>
                  Your upcoming appointments and availability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-16 w-16 text-healthcare-text-secondary mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-healthcare-text-primary mb-2">
                    Schedule Management
                  </h3>
                  <p className="text-healthcare-text-secondary mb-4">
                    Advanced scheduling features will be available here
                  </p>
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Manage Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Patient Details Modal */}
        {selectedPatient && (
          <Dialog open={showPatientDetails} onOpenChange={setShowPatientDetails}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Patient Details: {selectedPatient.name}</DialogTitle>
                <DialogDescription>
                  Comprehensive patient information and medical history
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Patient ID</Label>
                      <p className="text-sm text-healthcare-text-secondary">{selectedPatient.patientId}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Age</Label>
                      <p className="text-sm text-healthcare-text-secondary">{selectedPatient.age} years</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Blood Type</Label>
                      <p className="text-sm text-healthcare-text-secondary">{selectedPatient.bloodType}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Last Visit</Label>
                      <p className="text-sm text-healthcare-text-secondary">{selectedPatient.lastVisit}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Primary Condition</Label>
                      <p className="text-sm text-healthcare-text-secondary">{selectedPatient.condition}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Known Allergies</Label>
                      <p className="text-sm text-healthcare-text-secondary">{selectedPatient.allergies}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Current Medications</Label>
                      <div className="space-y-1">
                        {selectedPatient.currentMedications.map((med, index) => (
                          <p key={index} className="text-sm text-healthcare-text-secondary">• {med}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowPatientDetails(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setPrescriptionForm({...prescriptionForm, patientId: selectedPatient.patientId});
                  setShowPatientDetails(false);
                  setShowPrescriptionForm(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Prescription
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
