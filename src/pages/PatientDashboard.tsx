
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import {
  Calendar,
  Clock,
  FileText,
  Shield,
  User,
  Settings,
  Plus,
  Eye,
  EyeOff,
  Download,
  Edit,
  Trash2,
} from "lucide-react";

const PatientDashboard = () => {
  const { toast } = useToast();
  const [doctorAccess, setDoctorAccess] = useState({
    "Dr. Smith": true,
    "Dr. Johnson": false,
    "Dr. Brown": true,
  });

  const [appointments, setAppointments] = useState([
    {
      id: 1,
      doctor: "Dr. Sarah Smith",
      specialty: "Cardiology",
      date: "2024-01-15",
      time: "10:00 AM",
      status: "confirmed",
    },
    {
      id: 2,
      doctor: "Dr. Michael Brown",
      specialty: "General Practice",
      date: "2024-01-20",
      time: "2:30 PM",
      status: "pending",
    },
  ]);

  const [prescriptions, setPrescriptions] = useState([
    {
      id: 1,
      medication: "Lisinopril 10mg",
      prescriber: "Dr. Sarah Smith",
      date: "2024-01-10",
      status: "active",
      dosage: "Once daily",
      instructions: "Take with food",
    },
    {
      id: 2,
      medication: "Metformin 500mg",
      prescriber: "Dr. Michael Brown",
      date: "2024-01-08",
      status: "active",
      dosage: "Twice daily",
      instructions: "Take before meals",
    },
  ]);

  const [healthRecords, setHealthRecords] = useState([
    {
      id: 1,
      type: "Lab Results",
      description: "Complete Blood Count",
      date: "2024-01-05",
      doctor: "Dr. Sarah Smith",
      results: "Normal values across all parameters",
    },
    {
      id: 2,
      type: "Imaging",
      description: "Chest X-Ray",
      date: "2024-01-03",
      doctor: "Dr. Michael Brown",
      results: "Clear lungs, no abnormalities detected",
    },
  ]);

  const [appointmentForm, setAppointmentForm] = useState({
    doctor: "",
    specialty: "",
    date: "",
    time: "",
    reason: "",
  });

  const [profileForm, setProfileForm] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "(555) 123-4567",
    address: "123 Main St, City, State 12345",
    emergencyContact: "Jane Doe - (555) 987-6543",
  });

  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const toggleDoctorAccess = (doctorName: string) => {
    setDoctorAccess(prev => ({
      ...prev,
      [doctorName]: !prev[doctorName]
    }));
    
    toast({
      title: "Access Updated",
      description: `${doctorName} access has been ${!doctorAccess[doctorName] ? 'granted' : 'revoked'}.`,
    });
  };

  const handleBookAppointment = () => {
    if (!appointmentForm.doctor || !appointmentForm.date || !appointmentForm.time) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const newAppointment = {
      id: appointments.length + 1,
      doctor: appointmentForm.doctor,
      specialty: appointmentForm.specialty,
      date: appointmentForm.date,
      time: appointmentForm.time,
      status: "pending",
    };

    setAppointments([...appointments, newAppointment]);
    setAppointmentForm({ doctor: "", specialty: "", date: "", time: "", reason: "" });
    setShowAppointmentForm(false);

    toast({
      title: "Appointment Booked",
      description: `Your appointment with ${appointmentForm.doctor} has been scheduled.`,
    });
  };

  const handleCancelAppointment = (appointmentId: number) => {
    setAppointments(appointments.filter(apt => apt.id !== appointmentId));
    toast({
      title: "Appointment Cancelled",
      description: "Your appointment has been cancelled successfully.",
    });
  };

  const handleUpdateProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    });
    setShowProfileForm(false);
  };

  const handleDownloadRecord = (record: any) => {
    toast({
      title: "Download Started",
      description: `Downloading ${record.description}...`,
    });
  };

  const handleViewRecord = (record: any) => {
    setSelectedRecord(record);
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
                Patient Dashboard
              </h1>
              <p className="text-healthcare-text-secondary mt-1">
                Welcome back, {profileForm.firstName} {profileForm.lastName}
              </p>
            </div>
            <Dialog open={showAppointmentForm} onOpenChange={setShowAppointmentForm}>
              <DialogTrigger asChild>
                <Button className="bg-healthcare-blue hover:bg-healthcare-blue/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Book Appointment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Book New Appointment</DialogTitle>
                  <DialogDescription>
                    Schedule an appointment with your healthcare provider.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="doctor">Doctor</Label>
                    <Select
                      value={appointmentForm.doctor}
                      onValueChange={(value) => setAppointmentForm({...appointmentForm, doctor: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dr. Sarah Smith">Dr. Sarah Smith</SelectItem>
                        <SelectItem value="Dr. Michael Brown">Dr. Michael Brown</SelectItem>
                        <SelectItem value="Dr. Emily Johnson">Dr. Emily Johnson</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialty">Specialty</Label>
                    <Input
                      id="specialty"
                      value={appointmentForm.specialty}
                      onChange={(e) => setAppointmentForm({...appointmentForm, specialty: e.target.value})}
                      placeholder="e.g., Cardiology"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={appointmentForm.date}
                        onChange={(e) => setAppointmentForm({...appointmentForm, date: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={appointmentForm.time}
                        onChange={(e) => setAppointmentForm({...appointmentForm, time: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason for Visit</Label>
                    <Textarea
                      id="reason"
                      value={appointmentForm.reason}
                      onChange={(e) => setAppointmentForm({...appointmentForm, reason: e.target.value})}
                      placeholder="Brief description of your health concern..."
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAppointmentForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleBookAppointment}>
                    Book Appointment
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="records">Health Records</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-healthcare-text-secondary">Upcoming Appointments</span>
                    <span className="text-2xl font-bold text-healthcare-blue">
                      {appointments.filter(apt => apt.status === "confirmed").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-healthcare-text-secondary">Active Prescriptions</span>
                    <span className="text-2xl font-bold text-healthcare-green">
                      {prescriptions.filter(p => p.status === "active").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-healthcare-text-secondary">Health Records</span>
                    <span className="text-2xl font-bold text-healthcare-text-primary">
                      {healthRecords.length}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="bg-healthcare-blue-light p-2 rounded-full">
                        <Calendar className="h-4 w-4 text-healthcare-blue" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Appointment confirmed</p>
                        <p className="text-xs text-healthcare-text-secondary">with Dr. Sarah Smith - 2 days ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-healthcare-green-light p-2 rounded-full">
                        <FileText className="h-4 w-4 text-healthcare-green" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">New prescription added</p>
                        <p className="text-xs text-healthcare-text-secondary">Lisinopril 10mg - 3 days ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-healthcare-blue-light p-2 rounded-full">
                        <Shield className="h-4 w-4 text-healthcare-blue" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Privacy settings updated</p>
                        <p className="text-xs text-healthcare-text-secondary">Access granted to Dr. Brown - 1 week ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-healthcare-blue" />
                  <span>Your Appointments</span>
                </CardTitle>
                <CardDescription>
                  Manage your upcoming and past appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 border border-healthcare-gray rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-healthcare-blue-light p-2 rounded-full">
                          <User className="h-4 w-4 text-healthcare-blue" />
                        </div>
                        <div>
                          <h4 className="font-medium text-healthcare-text-primary">
                            {appointment.doctor}
                          </h4>
                          <p className="text-sm text-healthcare-text-secondary">
                            {appointment.specialty}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Clock className="h-3 w-3 text-healthcare-text-secondary" />
                            <span className="text-sm text-healthcare-text-secondary">
                              {appointment.date} at {appointment.time}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={appointment.status === "confirmed" ? "default" : "secondary"}
                          className={appointment.status === "confirmed" ? "bg-healthcare-green" : ""}
                        >
                          {appointment.status}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelAppointment(appointment.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="records" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Health Records */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-healthcare-text-primary" />
                    <span>Health Records</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {healthRecords.map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-4 border border-healthcare-gray rounded-lg hover:bg-healthcare-blue-light/50 transition-colors"
                      >
                        <div>
                          <h4 className="font-medium text-healthcare-text-primary">
                            {record.type}
                          </h4>
                          <p className="text-sm text-healthcare-text-secondary">
                            {record.description}
                          </p>
                          <p className="text-sm text-healthcare-text-secondary">
                            {record.date} • {record.doctor}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewRecord(record)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownloadRecord(record)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Prescriptions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-healthcare-green" />
                    <span>Active Prescriptions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {prescriptions.map((prescription) => (
                      <div
                        key={prescription.id}
                        className="p-4 border border-healthcare-gray rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-healthcare-text-primary">
                            {prescription.medication}
                          </h4>
                          <Badge className="bg-healthcare-green">
                            {prescription.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-healthcare-text-secondary mb-1">
                          Prescribed by {prescription.prescriber}
                        </p>
                        <p className="text-sm text-healthcare-text-secondary mb-1">
                          Dosage: {prescription.dosage}
                        </p>
                        <p className="text-sm text-healthcare-text-secondary">
                          Instructions: {prescription.instructions}
                        </p>
                        <p className="text-xs text-healthcare-text-secondary mt-2">
                          Date: {prescription.date}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Privacy Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-healthcare-blue" />
                    <span>Doctor Access Control</span>
                  </CardTitle>
                  <CardDescription>
                    Manage which doctors can access your health records
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(doctorAccess).map(([doctorName, hasAccess]) => (
                    <div key={doctorName} className="flex items-center justify-between p-3 border border-healthcare-gray rounded-lg">
                      <div>
                        <Label htmlFor={doctorName} className="font-medium">
                          {doctorName}
                        </Label>
                        <p className="text-sm text-healthcare-text-secondary">
                          {hasAccess ? "Can view and access your records" : "No access to your records"}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {hasAccess ? (
                          <Eye className="h-4 w-4 text-healthcare-green" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-healthcare-text-secondary" />
                        )}
                        <Switch
                          id={doctorName}
                          checked={hasAccess}
                          onCheckedChange={() => toggleDoctorAccess(doctorName)}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Profile Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-healthcare-text-primary" />
                    <span>Profile Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Name</Label>
                      <p className="text-sm text-healthcare-text-secondary">
                        {profileForm.firstName} {profileForm.lastName}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p className="text-sm text-healthcare-text-secondary">{profileForm.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Phone</Label>
                      <p className="text-sm text-healthcare-text-secondary">{profileForm.phone}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Address</Label>
                      <p className="text-sm text-healthcare-text-secondary">{profileForm.address}</p>
                    </div>
                  </div>
                  <Dialog open={showProfileForm} onOpenChange={setShowProfileForm}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>
                          Update your personal information.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              value={profileForm.firstName}
                              onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              value={profileForm.lastName}
                              onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address">Address</Label>
                          <Textarea
                            id="address"
                            value={profileForm.address}
                            onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                            rows={2}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowProfileForm(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleUpdateProfile}>
                          Save Changes
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Record Detail Modal */}
        {selectedRecord && (
          <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{selectedRecord.type}</DialogTitle>
                <DialogDescription>{selectedRecord.description}</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Date</Label>
                    <p className="text-sm text-healthcare-text-secondary">{selectedRecord.date}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Healthcare Provider</Label>
                    <p className="text-sm text-healthcare-text-secondary">{selectedRecord.doctor}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Results/Notes</Label>
                    <p className="text-sm text-healthcare-text-secondary">{selectedRecord.results}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => handleDownloadRecord(selectedRecord)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button onClick={() => setSelectedRecord(null)}>
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
