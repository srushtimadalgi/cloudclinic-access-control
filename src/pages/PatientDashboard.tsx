import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDoctorAccess } from "@/hooks/useDoctorAccess";
import { useProfile } from "@/hooks/useProfile";

const PatientDashboard = () => {
  const { toast } = useToast();
  const { data: profile } = useProfile();
  const { doctorAccess, loading: accessLoading, toggleDoctorAccess } = useDoctorAccess();

  // Fetch real doctors from database
  const { data: doctors } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          id,
          specialty,
          profiles!inner(first_name, last_name, status)
        `)
        .eq('profiles.status', 'active');

      if (error) throw error;
      return data;
    }
  });

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
    }
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
    }
  ]);

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

    const doctor = doctors?.find(d => d.id === newAppointment.doctorId);
    const appointment = {
      id: appointments.length + 1,
      doctorName: `Dr. ${doctor?.profiles.first_name} ${doctor?.profiles.last_name}` || "",
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
            Welcome back, {profile?.first_name} {profile?.last_name}
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
                    {doctorAccess.filter(d => d.hasAccess).length}
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
                      {doctors?.map(doctor => (
                        <option key={doctor.id} value={doctor.id}>
                          Dr. {doctor.profiles.first_name} {doctor.profiles.last_name} - {doctor.specialty}
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

          {/* Privacy Control Tab - Updated with real functionality */}
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
                  {accessLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-healthcare-blue mx-auto mb-2"></div>
                      <p className="text-sm text-healthcare-text-secondary">Loading doctors...</p>
                    </div>
                  ) : doctorAccess.length === 0 ? (
                    <div className="text-center py-8">
                      <User className="h-12 w-12 text-healthcare-text-secondary mx-auto mb-4" />
                      <p className="text-healthcare-text-secondary">No verified doctors available</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {doctorAccess.map((doctor) => (
                        <div key={doctor.doctorId} className="flex items-center justify-between p-4 border border-healthcare-gray rounded-lg hover:bg-healthcare-blue-light transition-colors">
                          <div className="flex items-center space-x-3">
                            <User className="h-8 w-8 text-healthcare-blue" />
                            <div>
                              <h4 className="font-medium text-healthcare-text-primary">
                                Dr. {doctor.doctorName}
                              </h4>
                              <p className="text-sm text-healthcare-text-secondary">{doctor.specialty}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`text-sm font-medium ${doctor.hasAccess ? 'text-healthcare-green' : 'text-healthcare-text-secondary'}`}>
                              {doctor.hasAccess ? "Access Granted" : "Access Denied"}
                            </span>
                            <Switch
                              checked={doctor.hasAccess}
                              onCheckedChange={() => toggleDoctorAccess(doctor.doctorId)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                      value={`${profile?.first_name || ''} ${profile?.last_name || ''}`}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      value={profile?.email || ''}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Role</label>
                    <Input
                      value={profile?.role || ''}
                      readOnly
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
