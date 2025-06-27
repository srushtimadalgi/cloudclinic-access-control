import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Navigation from "@/components/Navigation";
import { 
  Calendar as CalendarIcon, 
  Shield, 
  FileText, 
  Download, 
  User, 
  Heart, 
  Activity,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PatientDashboard = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Updated appointments with status tracking
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      doctorName: "Dr. Sarah Smith",
      specialty: "General Practitioner",
      date: "2024-01-20",
      time: "10:00 AM",
      status: "approved",
      reason: "Regular checkup",
      location: "CloudClinic Main Branch"
    },
    {
      id: 2,
      doctorName: "Dr. Michael Brown",
      specialty: "Cardiologist",
      date: "2024-01-25",
      time: "2:30 PM",
      status: "pending",
      reason: "Heart consultation",
      location: "CloudClinic Cardiology"
    },
    {
      id: 3,
      doctorName: "Dr. Sarah Smith",
      specialty: "General Practitioner",
      date: "2024-01-18",
      time: "11:00 AM",
      status: "canceled",
      reason: "Follow-up",
      location: "CloudClinic Main Branch"
    }
  ]);

  const [doctors] = useState([
    { id: 1, name: "Dr. Sarah Smith", specialty: "General Practitioner", hasAccess: true },
    { id: 2, name: "Dr. Michael Brown", specialty: "Cardiologist", hasAccess: false },
    { id: 3, name: "Dr. Emily Johnson", specialty: "Dermatologist", hasAccess: true }
  ]);

  const [prescriptions] = useState([
    {
      id: 1,
      medication: "Amoxicillin 500mg",
      dosage: "3 times daily",
      prescribedBy: "Dr. Sarah Smith",
      date: "2024-01-15",
      duration: "7 days",
      status: "active"
    },
    {
      id: 2,
      medication: "Lisinopril 10mg",
      dosage: "Once daily",
      prescribedBy: "Dr. Michael Brown",
      date: "2024-01-10",
      duration: "30 days",
      status: "completed"
    }
  ]);

  const [healthRecords] = useState([
    {
      id: 1,
      type: "Lab Report",
      title: "Blood Test Results",
      date: "2024-01-15",
      doctor: "Dr. Sarah Smith",
      status: "completed"
    },
    {
      id: 2,
      type: "Imaging",
      title: "Chest X-Ray",
      date: "2024-01-10",
      doctor: "Dr. Michael Brown",
      status: "completed"
    }
  ]);

  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+1 (555) 123-4567",
    dateOfBirth: "1985-03-15",
    bloodType: "O+",
    allergies: "Penicillin",
    emergencyContact: "Jane Doe - +1 (555) 987-6543"
  });

  const [newAppointment, setNewAppointment] = useState({
    doctorId: "",
    date: "",
    time: "",
    reason: ""
  });

  const bookAppointment = () => {
    if (!newAppointment.doctorId || !newAppointment.date || !newAppointment.time || !newAppointment.reason) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const doctor = doctors.find(d => d.id.toString() === newAppointment.doctorId);
    const appointment = {
      id: appointments.length + 1,
      doctorName: doctor?.name || "",
      specialty: doctor?.specialty || "",
      date: newAppointment.date,
      time: newAppointment.time,
      status: "pending",
      reason: newAppointment.reason,
      location: "CloudClinic Main Branch"
    };

    setAppointments([...appointments, appointment]);
    setNewAppointment({ doctorId: "", date: "", time: "", reason: "" });

    toast({
      title: "Appointment Booked",
      description: "Your appointment has been submitted and is pending approval",
    });
  };

  const toggleDoctorAccess = (doctorId: number) => {
    // This would update the doctor access in the backend
    toast({
      title: "Access Updated",
      description: "Doctor access permissions have been updated",
    });
  };

  const updateProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-500";
      case "pending": return "bg-yellow-500";
      case "canceled": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="h-4 w-4" />;
      case "pending": return <Clock className="h-4 w-4" />;
      case "canceled": return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-healthcare-gray">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-healthcare-text-primary">
            Patient Dashboard
          </h1>
          <p className="text-healthcare-text-secondary mt-1">
            Welcome back, {profile.name}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-healthcare-text-secondary">Upcoming Appointments</p>
                  <p className="text-2xl font-bold text-healthcare-text-primary">
                    {appointments.filter(apt => apt.status === "approved").length}
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
                  <p className="text-sm text-healthcare-text-secondary">Health Records</p>
                  <p className="text-2xl font-bold text-healthcare-text-primary">{healthRecords.length}</p>
                </div>
                <Heart className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-healthcare-text-secondary">Doctors Access</p>
                  <p className="text-2xl font-bold text-healthcare-text-primary">
                    {doctors.filter(d => d.hasAccess).length}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-healthcare-blue" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="records">Health Records</TabsTrigger>
            <TabsTrigger value="privacy">Privacy Control</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Book Appointment */}
              <Card>
                <CardHeader>
                  <CardTitle>Book New Appointment</CardTitle>
                  <CardDescription>
                    Schedule an appointment with your doctor
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Select Doctor</label>
                    <select
                      value={newAppointment.doctorId}
                      onChange={(e) => setNewAppointment({...newAppointment, doctorId: e.target.value})}
                      className="w-full mt-1 p-2 border border-healthcare-gray rounded-md"
                    >
                      <option value="">Choose a doctor</option>
                      {doctors.map(doctor => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.name} - {doctor.specialty}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Date</label>
                    <Input
                      type="date"
                      value={newAppointment.date}
                      onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Time</label>
                    <select
                      value={newAppointment.time}
                      onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
                      className="w-full mt-1 p-2 border border-healthcare-gray rounded-md"
                    >
                      <option value="">Select time</option>
                      <option value="9:00 AM">9:00 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="2:00 PM">2:00 PM</option>
                      <option value="3:00 PM">3:00 PM</option>
                      <option value="4:00 PM">4:00 PM</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Reason for Visit</label>
                    <Input
                      value={newAppointment.reason}
                      onChange={(e) => setNewAppointment({...newAppointment, reason: e.target.value})}
                      placeholder="e.g., Regular checkup, Follow-up..."
                    />
                  </div>
                  <Button onClick={bookAppointment} className="w-full">
                    Book Appointment
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your latest medical activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-healthcare-blue-light rounded-lg">
                      <Activity className="h-5 w-5 text-healthcare-blue" />
                      <div>
                        <p className="text-sm font-medium">Prescription Updated</p>
                        <p className="text-xs text-healthcare-text-secondary">Dr. Sarah Smith - 2 days ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-healthcare-blue-light rounded-lg">
                      <CalendarIcon className="h-5 w-5 text-healthcare-green" />
                      <div>
                        <p className="text-sm font-medium">Appointment Completed</p>
                        <p className="text-xs text-healthcare-text-secondary">Dr. Michael Brown - 5 days ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-healthcare-blue-light rounded-lg">
                      <FileText className="h-5 w-5 text-healthcare-blue" />
                      <div>
                        <p className="text-sm font-medium">Lab Results Available</p>
                        <p className="text-xs text-healthcare-text-secondary">Blood Test - 1 week ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>My Appointments</CardTitle>
                <CardDescription>
                  View and manage your appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{appointment.doctorName}</div>
                            <div className="text-sm text-healthcare-text-secondary">{appointment.specialty}</div>
                          </div>
                        </TableCell>
                        <TableCell>{appointment.date}</TableCell>
                        <TableCell>{appointment.time}</TableCell>
                        <TableCell>{appointment.reason}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(appointment.status)}
                            <Badge className={getStatusColor(appointment.status)}>
                              {appointment.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{appointment.location}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Health Records Tab */}
          <TabsContent value="records">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Health Records */}
              <Card>
                <CardHeader>
                  <CardTitle>Health Records</CardTitle>
                  <CardDescription>
                    Your medical records and test results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {healthRecords.map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-4 border border-healthcare-gray rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-8 w-8 text-healthcare-blue" />
                          <div>
                            <h4 className="font-medium text-healthcare-text-primary">{record.title}</h4>
                            <p className="text-sm text-healthcare-text-secondary">
                              {record.type} • {record.doctor} • {record.date}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Prescriptions */}
              <Card>
                <CardHeader>
                  <CardTitle>My Prescriptions</CardTitle>
                  <CardDescription>
                    Current and past prescriptions
                  </CardDescription>
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
                          {prescription.dosage} • {prescription.duration}
                        </p>
                        <p className="text-sm text-healthcare-text-secondary">
                          Prescribed by {prescription.prescribedBy} on {prescription.date}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Privacy Control Tab */}
          <TabsContent value="privacy">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Doctor Access Control */}
              <Card>
                <CardHeader>
                  <CardTitle>Doctor Access Control</CardTitle>
                  <CardDescription>
                    Manage which doctors can access your medical records
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {doctors.map((doctor) => (
                      <div key={doctor.id} className="flex items-center justify-between p-4 border border-healthcare-gray rounded-lg">
                        <div className="flex items-center space-x-3">
                          <User className="h-8 w-8 text-healthcare-blue" />
                          <div>
                            <h4 className="font-medium text-healthcare-text-primary">{doctor.name}</h4>
                            <p className="text-sm text-healthcare-text-secondary">{doctor.specialty}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={doctor.hasAccess}
                            onCheckedChange={() => toggleDoctorAccess(doctor.id)}
                          />
                          <span className="text-sm text-healthcare-text-secondary">
                            {doctor.hasAccess ? "Access Granted" : "Access Denied"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Profile Management */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Full Name</label>
                    <Input
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <Input
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Blood Type</label>
                    <Input
                      value={profile.bloodType}
                      onChange={(e) => setProfile({...profile, bloodType: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Allergies</label>
                    <Input
                      value={profile.allergies}
                      onChange={(e) => setProfile({...profile, allergies: e.target.value})}
                    />
                  </div>
                  <Button onClick={updateProfile} className="w-full">
                    Update Profile
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PatientDashboard;
