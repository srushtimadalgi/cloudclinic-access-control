
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Navigation from "@/components/Navigation";
import { Users, Calendar, Search, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [appointmentFilter, setAppointmentFilter] = useState("all");

  // Mock data for users
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Dr. Sarah Smith",
      email: "dr.smith@cloudclinic.com",
      role: "doctor",
      status: "active",
      joinedDate: "2024-01-15",
      patients: 45
    },
    {
      id: 2,
      name: "John Doe",
      email: "john.doe@email.com",
      role: "patient",
      status: "active",
      joinedDate: "2024-02-10",
      appointments: 8
    },
    {
      id: 3,
      name: "Dr. Michael Brown",
      email: "dr.brown@cloudclinic.com",
      role: "doctor",
      status: "inactive",
      joinedDate: "2024-01-20",
      patients: 32
    },
    {
      id: 4,
      name: "Jane Smith",
      email: "jane.smith@email.com",
      role: "patient",
      status: "active",
      joinedDate: "2024-02-05",
      appointments: 3
    }
  ]);

  // Mock data for appointments
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      patientName: "John Doe",
      doctorName: "Dr. Sarah Smith",
      date: "2024-01-20",
      time: "10:00 AM",
      status: "approved"
    },
    {
      id: 2,
      patientName: "Jane Smith",
      doctorName: "Dr. Michael Brown",
      date: "2024-01-22",
      time: "2:30 PM",
      status: "pending"
    },
    {
      id: 3,
      patientName: "John Doe",
      doctorName: "Dr. Sarah Smith",
      date: "2024-01-25",
      time: "11:15 AM",
      status: "canceled"
    }
  ]);

  const toggleUserStatus = (userId: number) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === "active" ? "inactive" : "active" }
        : user
    ));
    toast({
      title: "User Status Updated",
      description: "User account status has been changed successfully.",
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const filteredAppointments = appointments.filter(appointment => {
    if (appointmentFilter === "all") return true;
    return appointment.status === appointmentFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "inactive": return "bg-red-500";
      case "approved": return "bg-green-500";
      case "pending": return "bg-yellow-500";
      case "canceled": return "bg-red-500";
      default: return "bg-gray-500";
    }
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
                Admin Dashboard
              </h1>
              <p className="text-healthcare-text-secondary mt-1">
                Manage users and appointments - CloudClinic
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-healthcare-blue" />
                <span className="text-sm font-medium">Admin Access</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-healthcare-text-secondary">Total Users</p>
                  <p className="text-2xl font-bold text-healthcare-text-primary">{users.length}</p>
                </div>
                <Users className="h-8 w-8 text-healthcare-blue" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-healthcare-text-secondary">Total Appointments</p>
                  <p className="text-2xl font-bold text-healthcare-text-primary">{appointments.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-healthcare-green" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-healthcare-text-secondary">Active Doctors</p>
                  <p className="text-2xl font-bold text-healthcare-text-primary">
                    {users.filter(u => u.role === "doctor" && u.status === "active").length}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-healthcare-blue" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          {/* User Management */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-healthcare-blue" />
                <span>User Management</span>
              </CardTitle>
              <CardDescription>
                View and manage all patients and doctors
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-healthcare-text-secondary h-4 w-4" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={filterRole === "all" ? "default" : "outline"}
                    onClick={() => setFilterRole("all")}
                    size="sm"
                  >
                    All
                  </Button>
                  <Button
                    variant={filterRole === "doctor" ? "default" : "outline"}
                    onClick={() => setFilterRole("doctor")}
                    size="sm"
                  >
                    Doctors
                  </Button>
                  <Button
                    variant={filterRole === "patient" ? "default" : "outline"}
                    onClick={() => setFilterRole("patient")}
                    size="sm"
                  >
                    Patients
                  </Button>
                </div>
              </div>

              {/* Users Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Stats</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={user.role === "doctor" ? "text-healthcare-blue" : "text-healthcare-green"}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.joinedDate}</TableCell>
                      <TableCell>
                        {user.role === "doctor" ? `${user.patients} patients` : `${user.appointments} appointments`}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={user.status === "active"}
                            onCheckedChange={() => toggleUserStatus(user.id)}
                          />
                          <span className="text-sm text-healthcare-text-secondary">
                            {user.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Appointment Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-healthcare-green" />
                <span>Appointment Management</span>
              </CardTitle>
              <CardDescription>
                View and manage all appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Appointment Filter */}
              <div className="flex gap-2 mb-6">
                <Button
                  variant={appointmentFilter === "all" ? "default" : "outline"}
                  onClick={() => setAppointmentFilter("all")}
                  size="sm"
                >
                  All
                </Button>
                <Button
                  variant={appointmentFilter === "pending" ? "default" : "outline"}
                  onClick={() => setAppointmentFilter("pending")}
                  size="sm"
                >
                  Pending
                </Button>
                <Button
                  variant={appointmentFilter === "approved" ? "default" : "outline"}
                  onClick={() => setAppointmentFilter("approved")}
                  size="sm"
                >
                  Approved
                </Button>
                <Button
                  variant={appointmentFilter === "canceled" ? "default" : "outline"}
                  onClick={() => setAppointmentFilter("canceled")}
                  size="sm"
                >
                  Canceled
                </Button>
              </div>

              {/* Appointments Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell className="font-medium">{appointment.patientName}</TableCell>
                      <TableCell>{appointment.doctorName}</TableCell>
                      <TableCell>{appointment.date}</TableCell>
                      <TableCell>{appointment.time}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
