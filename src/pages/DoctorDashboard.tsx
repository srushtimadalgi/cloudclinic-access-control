
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
} from "lucide-react";

const DoctorDashboard = () => {
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  const todayAppointments = [
    {
      id: 1,
      patient: "John Doe",
      time: "10:00 AM",
      type: "Follow-up",
      status: "confirmed",
      hasAccess: true,
    },
    {
      id: 2,
      patient: "Jane Smith",
      time: "11:30 AM",
      type: "Consultation",
      status: "confirmed",
      hasAccess: false,
    },
    {
      id: 3,
      patient: "Robert Johnson",
      time: "2:00 PM",
      type: "Check-up",
      status: "pending",
      hasAccess: true,
    },
  ];

  const patientRecords = [
    {
      id: 1,
      name: "John Doe",
      lastVisit: "2024-01-10",
      condition: "Hypertension",
      hasAccess: true,
    },
    {
      id: 2,
      name: "Robert Johnson",
      lastVisit: "2024-01-08",
      condition: "Diabetes",
      hasAccess: true,
    },
  ];

  const prescriptionQueue = [
    {
      id: 1,
      patient: "John Doe",
      medication: "Lisinopril 10mg",
      status: "pending",
      date: "2024-01-12",
    },
    {
      id: 2,
      patient: "Robert Johnson",
      medication: "Metformin 500mg",
      status: "completed",
      date: "2024-01-11",
    },
  ];

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
            <Button className="bg-healthcare-green hover:bg-healthcare-green/90">
              <Plus className="h-4 w-4 mr-2" />
              New Prescription
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-healthcare-blue" />
                  <span>Today's Appointments</span>
                </CardTitle>
                <CardDescription>
                  Your scheduled appointments for today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 border border-healthcare-gray rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-healthcare-green-light p-2 rounded-full">
                          <Users className="h-4 w-4 text-healthcare-green" />
                        </div>
                        <div>
                          <h4 className="font-medium text-healthcare-text-primary">
                            {appointment.patient}
                          </h4>
                          <p className="text-sm text-healthcare-text-secondary">
                            {appointment.type}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Clock className="h-3 w-3 text-healthcare-text-secondary" />
                            <span className="text-sm text-healthcare-text-secondary">
                              {appointment.time}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {appointment.hasAccess ? (
                          <Badge className="bg-healthcare-green">Has Access</Badge>
                        ) : (
                          <Badge variant="secondary">No Access</Badge>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={!appointment.hasAccess}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Records
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Patient Records Access */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-healthcare-text-primary" />
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
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  {patientRecords.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-4 border border-healthcare-gray rounded-lg hover:bg-healthcare-blue-light/50 transition-colors"
                    >
                      <div>
                        <h4 className="font-medium text-healthcare-text-primary">
                          {record.name}
                        </h4>
                        <p className="text-sm text-healthcare-text-secondary">
                          Last visit: {record.lastVisit}
                        </p>
                        <p className="text-sm text-healthcare-text-secondary">
                          Condition: {record.condition}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-healthcare-green">Access Granted</Badge>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Prescription Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Stethoscope className="h-5 w-5 text-healthcare-green" />
                  <span>Recent Prescriptions</span>
                </CardTitle>
                <CardDescription>
                  Manage and track patient prescriptions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {prescriptionQueue.map((prescription) => (
                    <div
                      key={prescription.id}
                      className="flex items-center justify-between p-4 border border-healthcare-gray rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium text-healthcare-text-primary">
                          {prescription.medication}
                        </h4>
                        <p className="text-sm text-healthcare-text-secondary">
                          Patient: {prescription.patient}
                        </p>
                        <p className="text-sm text-healthcare-text-secondary">
                          Date: {prescription.date}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={prescription.status === "completed" ? "default" : "secondary"}
                          className={prescription.status === "completed" ? "bg-healthcare-green" : "bg-yellow-500"}
                        >
                          {prescription.status}
                        </Badge>
                        {prescription.status === "pending" && (
                          <Button variant="outline" size="sm">
                            <Upload className="h-4 w-4 mr-1" />
                            Upload
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-healthcare-text-secondary">Total Appointments</span>
                  <span className="text-2xl font-bold text-healthcare-blue">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-healthcare-text-secondary">Pending Prescriptions</span>
                  <span className="text-2xl font-bold text-yellow-500">1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-healthcare-text-secondary">Accessible Records</span>
                  <span className="text-2xl font-bold text-healthcare-green">2</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start bg-healthcare-green hover:bg-healthcare-green/90">
                  <Plus className="h-4 w-4 mr-2" />
                  New Prescription
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Schedule
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Patient List
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Medical Records
                </Button>
              </CardContent>
            </Card>

            {/* Upload Prescription */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Prescription</CardTitle>
                <CardDescription>
                  Upload prescription for authorized patients
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="patient-select">Patient</Label>
                  <select 
                    id="patient-select"
                    className="w-full p-2 border border-healthcare-gray rounded-md"
                    value={selectedPatient || ""}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                  >
                    <option value="">Select patient...</option>
                    <option value="john-doe">John Doe</option>
                    <option value="robert-johnson">Robert Johnson</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medication">Medication</Label>
                  <Input id="medication" placeholder="e.g., Lisinopril 10mg" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea 
                    id="instructions" 
                    placeholder="Dosage and instructions..."
                    rows={3}
                  />
                </div>
                <Button 
                  className="w-full bg-healthcare-green hover:bg-healthcare-green/90"
                  disabled={!selectedPatient}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Prescription
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
