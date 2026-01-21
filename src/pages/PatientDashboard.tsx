import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
  XCircle,
  Upload,
  Bell,
  Stethoscope,
  Video
} from "lucide-react";
import { JoinVideoCallButton } from "@/components/VideoConsultation";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDoctorAccess } from "@/hooks/useDoctorAccess";
import { useProfile } from "@/hooks/useProfile";
import { useNotifications } from "@/hooks/useNotifications";
import { useMedicalReports } from "@/hooks/useMedicalReports";
import { usePrescriptions } from "@/hooks/usePrescriptions";
import { useAuth } from "@/contexts/AuthContext";

const PatientDashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const { doctorAccess, loading: accessLoading, toggleDoctorAccess } = useDoctorAccess();
  const { notifications, markAsRead } = useNotifications();
  const { reports, uploading, uploadReport } = useMedicalReports();
  const { prescriptions } = usePrescriptions();

  const [uploadDialog, setUploadDialog] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");

  // Fetch all doctors with real-time updates (no verification required)
  const { data: allDoctors, isLoading: doctorsLoading } = useQuery({
    queryKey: ['all-doctors'],
    queryFn: async () => {
      console.log('PatientDashboard: Fetching all doctors...');
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          id,
          specialty,
          license_number,
          profiles!inner(
            id,
            first_name, 
            last_name, 
            status,
            email
          )
        `)
        .eq('profiles.status', 'active')
        .order('id', { ascending: true });

      if (error) {
        console.error('Error fetching doctors:', error);
        throw error;
      }
      
      console.log('PatientDashboard: Fetched doctors count:', data?.length || 0);
      console.log('PatientDashboard: Fetched doctors:', data);
      return data;
    },
    refetchInterval: false, // Remove automatic refetch to prevent redirect loops
    refetchIntervalInBackground: false
  });

  // Fetch appointments for the current user
  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ['patient-appointments', user?.id],
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
          doctor_id,
          consultation_type,
          doctors!inner(
            specialty,
            profiles!inner(first_name, last_name)
          )
        `)
        .eq('patient_id', user.id)
        .order('appointment_date', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const [newAppointment, setNewAppointment] = useState({
    doctorId: "",
    date: "",
    time: "",
    reason: "",
    consultationType: "in-person" as "in-person" | "video"
  });

  const bookAppointment = async () => {
    if (!newAppointment.doctorId || !newAppointment.date || !newAppointment.time || !newAppointment.reason) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to book an appointment",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Booking appointment:', {
        patient_id: user.id,
        doctor_id: newAppointment.doctorId,
        appointment_date: newAppointment.date,
        appointment_time: newAppointment.time,
        notes: newAppointment.reason,
        status: 'pending'
      });

      const { error } = await supabase
        .from('appointments')
        .insert({
          patient_id: user.id,
          doctor_id: newAppointment.doctorId,
          appointment_date: newAppointment.date,
          appointment_time: newAppointment.time,
          notes: newAppointment.reason,
          status: 'pending',
          consultation_type: newAppointment.consultationType
        });

      if (error) {
        console.error('Appointment booking error:', error);
        throw error;
      }

      setNewAppointment({ doctorId: "", date: "", time: "", reason: "", consultationType: "in-person" });
      queryClient.invalidateQueries({ queryKey: ['patient-appointments'] });

      toast({
        title: "Appointment Booked",
        description: "Your appointment has been submitted and is pending approval",
      });
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to book appointment",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile || !uploadTitle) {
      toast({
        title: "Error",
        description: "Please select a file and enter a title",
        variant: "destructive",
      });
      return;
    }

    await uploadReport(uploadFile, uploadTitle);
    setUploadDialog(false);
    setUploadFile(null);
    setUploadTitle("");
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

  // Real-time subscription for doctor updates
  useEffect(() => {
    const channel = supabase
      .channel('doctor-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'doctors'
        },
        () => {
          console.log('Doctor data changed, refetching...');
          queryClient.invalidateQueries({ queryKey: ['all-doctors'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          console.log('Profile data changed, refetching...');
          queryClient.invalidateQueries({ queryKey: ['all-doctors'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  if (doctorsLoading || appointmentsLoading) {
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
                Patient Dashboard
              </h1>
              <p className="text-healthcare-text-secondary mt-1">
                Welcome back, {profile?.first_name} {profile?.last_name}
              </p>
            </div>
            {/* Notifications */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="h-6 w-6 text-healthcare-blue" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-healthcare-text-secondary">Appointments</p>
                  <p className="text-2xl font-bold text-healthcare-text-primary">
                    {appointments.filter(apt => apt.status === "confirmed").length}
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
                  <p className="text-sm text-healthcare-text-secondary">Prescriptions</p>
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
                  <p className="text-sm text-healthcare-text-secondary">Reports</p>
                  <p className="text-2xl font-bold text-healthcare-text-primary">{reports.length}</p>
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
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-healthcare-text-secondary">Available Doctors</p>
                  <p className="text-2xl font-bold text-healthcare-text-primary">
                    {allDoctors?.length || 0}
                  </p>
                </div>
                <Stethoscope className="h-8 w-8 text-healthcare-blue" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="reports">Medical Reports</TabsTrigger>
            <TabsTrigger value="doctors">All Doctors</TabsTrigger>
            <TabsTrigger value="privacy">Privacy Control</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Book Appointment */}
              <Card>
                <CardHeader>
                  <CardTitle>Book New Appointment</CardTitle>
                  <CardDescription>Schedule an appointment with your doctor</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Select Doctor</label>
                    <select
                      value={newAppointment.doctorId}
                      onChange={(e) => setNewAppointment({...newAppointment, doctorId: e.target.value})}
                      className="w-full mt-1 p-2 border border-healthcare-gray rounded-md bg-white"
                    >
                      <option value="">Choose a doctor</option>
                      {allDoctors?.map(doctor => (
                        <option key={doctor.id} value={doctor.id}>
                          Dr. {doctor.profiles.first_name} {doctor.profiles.last_name} - {doctor.specialty}
                        </option>
                      ))}
                    </select>
                    {doctorsLoading && (
                      <p className="text-sm text-healthcare-text-secondary mt-1">Loading doctors...</p>
                    )}
                    {!doctorsLoading && (!allDoctors || allDoctors.length === 0) && (
                      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-sm text-yellow-800">
                          <strong>No doctors available.</strong> Please wait for doctors to sign up.
                        </p>
                      </div>
                    )}
                    {allDoctors && allDoctors.length > 0 && (
                      <p className="text-sm text-green-600 mt-1">
                        {allDoctors.length} doctor{allDoctors.length !== 1 ? 's' : ''} available
                      </p>
                    )}
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
                      className="w-full mt-1 p-2 border border-healthcare-gray rounded-md bg-white"
                    >
                      <option value="">Select time</option>
                      <option value="09:00:00">9:00 AM</option>
                      <option value="10:00:00">10:00 AM</option>
                      <option value="11:00:00">11:00 AM</option>
                      <option value="14:00:00">2:00 PM</option>
                      <option value="15:00:00">3:00 PM</option>
                      <option value="16:00:00">4:00 PM</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Consultation Type</label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="consultationType"
                          value="in-person"
                          checked={newAppointment.consultationType === "in-person"}
                          onChange={(e) => setNewAppointment({...newAppointment, consultationType: e.target.value as "in-person" | "video"})}
                          className="w-4 h-4 text-healthcare-blue"
                        />
                        <span className="text-sm">In-Person</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="consultationType"
                          value="video"
                          checked={newAppointment.consultationType === "video"}
                          onChange={(e) => setNewAppointment({...newAppointment, consultationType: e.target.value as "in-person" | "video"})}
                          className="w-4 h-4 text-healthcare-blue"
                        />
                        <Video className="h-4 w-4" />
                        <span className="text-sm">Video Call</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Reason for Visit</label>
                    <Input
                      value={newAppointment.reason}
                      onChange={(e) => setNewAppointment({...newAppointment, reason: e.target.value})}
                      placeholder="e.g., Regular checkup, Follow-up..."
                    />
                  </div>
                  <Button 
                    onClick={bookAppointment} 
                    className="w-full"
                    disabled={!allDoctors || allDoctors.length === 0}
                  >
                    Book Appointment
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Notifications</CardTitle>
                  <CardDescription>Your latest notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {notifications.slice(0, 5).map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          !notification.read 
                            ? 'bg-healthcare-blue-light border-healthcare-blue' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                        onClick={() => !notification.read && markAsRead(notification.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{notification.title}</p>
                            <p className="text-xs text-healthcare-text-secondary mt-1">{notification.message}</p>
                          </div>
                          {!notification.read && (
                            <div className="w-3 h-3 bg-healthcare-blue rounded-full flex-shrink-0 ml-2"></div>
                          )}
                        </div>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <div className="text-center py-8">
                        <Bell className="h-12 w-12 text-healthcare-text-secondary mx-auto mb-4" />
                        <p className="text-healthcare-text-secondary">No notifications</p>
                      </div>
                    )}
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
                <CardDescription>View and manage your appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appointment: any) => (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              Dr. {appointment.doctors.profiles.first_name} {appointment.doctors.profiles.last_name}
                            </div>
                            <div className="text-sm text-healthcare-text-secondary">{appointment.doctors.specialty}</div>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(appointment.appointment_date).toLocaleDateString()}</TableCell>
                        <TableCell>{appointment.appointment_time}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {appointment.consultation_type === 'video' ? (
                              <Badge variant="outline" className="gap-1 border-healthcare-blue text-healthcare-blue">
                                <Video className="h-3 w-3" />
                                Video
                              </Badge>
                            ) : (
                              <Badge variant="outline">In-Person</Badge>
                            )}
                          </div>
                        </TableCell>
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
                          <JoinVideoCallButton
                            appointmentId={appointment.id}
                            consultationType={appointment.consultation_type || 'in-person'}
                            status={appointment.status}
                            participantName={`${profile?.first_name} ${profile?.last_name}`}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {appointments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-healthcare-text-secondary">
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
                <CardTitle>My Prescriptions</CardTitle>
                <CardDescription>Current and past prescriptions from doctors</CardDescription>
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
                        <strong>Dosage:</strong> {prescription.dosage} • <strong>Duration:</strong> {prescription.duration}
                      </p>
                      {prescription.instructions && (
                        <p className="text-sm text-healthcare-text-secondary">
                          <strong>Instructions:</strong> {prescription.instructions}
                        </p>
                      )}
                      <p className="text-sm text-healthcare-text-secondary mt-2">
                        Prescribed by {prescription.doctor_name} on {new Date(prescription.created_at).toLocaleDateString()}
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

          {/* Medical Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Medical Reports</CardTitle>
                    <CardDescription>Upload and manage your medical reports</CardDescription>
                  </div>
                  <Dialog open={uploadDialog} onOpenChange={setUploadDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Report
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upload Medical Report</DialogTitle>
                        <DialogDescription>
                          Upload your medical reports, lab results, or other medical documents
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="title">Report Title</Label>
                          <Input
                            id="title"
                            value={uploadTitle}
                            onChange={(e) => setUploadTitle(e.target.value)}
                            placeholder="e.g., Blood Test Results, X-Ray Report"
                          />
                        </div>
                        <div>
                          <Label htmlFor="file">Select File</Label>
                          <Input
                            id="file"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setUploadDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleFileUpload} disabled={uploading}>
                            {uploading ? "Uploading..." : "Upload"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border border-healthcare-gray rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-8 w-8 text-healthcare-blue" />
                        <div>
                          <h4 className="font-medium text-healthcare-text-primary">{report.title}</h4>
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
                  {reports.length === 0 && (
                    <p className="text-center text-healthcare-text-secondary py-8">No medical reports uploaded</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Doctors Tab - Updated */}
          <TabsContent value="doctors">
            <Card>
              <CardHeader>
                <CardTitle>Available Doctors</CardTitle>
                <CardDescription>
                  Browse all doctors in the system
                  {allDoctors && allDoctors.length > 0 && (
                    <span className="text-green-600 font-medium ml-2">
                      ({allDoctors.length} doctor{allDoctors.length !== 1 ? 's' : ''} available)
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {doctorsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-healthcare-blue mx-auto mb-4"></div>
                    <p className="text-healthcare-text-secondary">Loading doctors...</p>
                  </div>
                ) : !allDoctors || allDoctors.length === 0 ? (
                  <div className="text-center py-12">
                    <Stethoscope className="h-16 w-16 text-healthcare-text-secondary mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-healthcare-text-primary mb-2">No Doctors Available</h3>
                    <p className="text-healthcare-text-secondary mb-4">
                      There are currently no doctors in the system.
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> Please wait for doctors to sign up to the system.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allDoctors.map((doctor) => (
                      <Card key={doctor.id} className="hover:shadow-lg transition-shadow border-2 hover:border-healthcare-blue">
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-3">
                            <div className="bg-healthcare-blue p-3 rounded-full flex-shrink-0">
                              <Stethoscope className="h-8 w-8 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-healthcare-text-primary text-lg">
                                Dr. {doctor.profiles.first_name} {doctor.profiles.last_name}
                              </h3>
                              <p className="text-healthcare-text-secondary font-medium">{doctor.specialty}</p>
                              <p className="text-xs text-healthcare-text-secondary mt-1">
                                License: {doctor.license_number}
                              </p>
                              <p className="text-xs text-healthcare-text-secondary">
                                {doctor.profiles.email}
                              </p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge variant={doctor.profiles.status === "active" ? "success" : "secondary"}>
                                  {doctor.profiles.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Control Tab */}
          <TabsContent value="privacy">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                {doctor.doctorName}
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

              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Your personal information</CardDescription>
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
