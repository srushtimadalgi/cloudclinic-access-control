
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
} from "lucide-react";

const PatientDashboard = () => {
  const [doctorAccess, setDoctorAccess] = useState({
    "Dr. Smith": true,
    "Dr. Johnson": false,
    "Dr. Brown": true,
  });

  const upcomingAppointments = [
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
  ];

  const recentPrescriptions = [
    {
      id: 1,
      medication: "Lisinopril 10mg",
      prescriber: "Dr. Sarah Smith",
      date: "2024-01-10",
      status: "active",
    },
    {
      id: 2,
      medication: "Metformin 500mg",
      prescriber: "Dr. Michael Brown",
      date: "2024-01-08",
      status: "active",
    },
  ];

  const healthRecords = [
    {
      id: 1,
      type: "Lab Results",
      description: "Complete Blood Count",
      date: "2024-01-05",
      doctor: "Dr. Sarah Smith",
    },
    {
      id: 2,
      type: "Imaging",
      description: "Chest X-Ray",
      date: "2024-01-03",
      doctor: "Dr. Michael Brown",
    },
  ];

  const toggleDoctorAccess = (doctorName: string) => {
    setDoctorAccess(prev => ({
      ...prev,
      [doctorName]: !prev[doctorName]
    }));
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
                Welcome back, John Doe
              </p>
            </div>
            <Button className="bg-healthcare-blue hover:bg-healthcare-blue/90">
              <Plus className="h-4 w-4 mr-2" />
              Book Appointment
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-healthcare-blue" />
                  <span>Upcoming Appointments</span>
                </CardTitle>
                <CardDescription>
                  Your scheduled medical appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
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
                      <Badge
                        variant={appointment.status === "confirmed" ? "default" : "secondary"}
                        className={appointment.status === "confirmed" ? "bg-healthcare-green" : ""}
                      >
                        {appointment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Prescriptions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-healthcare-green" />
                  <span>Recent Prescriptions</span>
                </CardTitle>
                <CardDescription>
                  Your current and recent medications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentPrescriptions.map((prescription) => (
                    <div
                      key={prescription.id}
                      className="flex items-center justify-between p-4 border border-healthcare-gray rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium text-healthcare-text-primary">
                          {prescription.medication}
                        </h4>
                        <p className="text-sm text-healthcare-text-secondary">
                          Prescribed by {prescription.prescriber}
                        </p>
                        <p className="text-sm text-healthcare-text-secondary">
                          {prescription.date}
                        </p>
                      </div>
                      <Badge className="bg-healthcare-green">
                        {prescription.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Health Records */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-healthcare-text-primary" />
                  <span>Health Records</span>
                </CardTitle>
                <CardDescription>
                  Your medical history and test results
                </CardDescription>
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
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Privacy Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-healthcare-blue" />
                  <span>Privacy Controls</span>
                </CardTitle>
                <CardDescription>
                  Manage who can access your health records
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(doctorAccess).map(([doctorName, hasAccess]) => (
                  <div key={doctorName} className="flex items-center justify-between">
                    <div>
                      <Label htmlFor={doctorName} className="font-medium">
                        {doctorName}
                      </Label>
                      <p className="text-sm text-healthcare-text-secondary">
                        {hasAccess ? "Can view records" : "No access"}
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
                <div className="pt-4 border-t">
                  <Button variant="outline" size="sm" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage All Access
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Appointment
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Request Records
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Update Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
