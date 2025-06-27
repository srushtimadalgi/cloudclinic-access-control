
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Navigation from "@/components/Navigation";
import {
  Users,
  Activity,
  Shield,
  FileText,
  Search,
  Settings,
  AlertTriangle,
  TrendingUp,
  Eye,
  Download,
} from "lucide-react";

const AdminDashboard = () => {
  const systemStats = [
    { label: "Total Users", value: "1,247", change: "+12%", icon: Users, color: "text-healthcare-blue" },
    { label: "Active Sessions", value: "89", change: "+5%", icon: Activity, color: "text-healthcare-green" },
    { label: "Security Events", value: "3", change: "-2%", icon: Shield, color: "text-yellow-500" },
    { label: "System Health", value: "98%", change: "+1%", icon: TrendingUp, color: "text-healthcare-green" },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "access_granted",
      user: "John Doe (Patient)",
      action: "Granted access to Dr. Smith",
      timestamp: "2024-01-12 14:30:00",
      severity: "info",
    },
    {
      id: 2,
      type: "prescription_upload",
      user: "Dr. Sarah Smith",
      action: "Uploaded prescription for John Doe",
      timestamp: "2024-01-12 14:25:00",
      severity: "info",
    },
    {
      id: 3,
      type: "access_revoked",
      user: "Jane Smith (Patient)",
      action: "Revoked access from Dr. Johnson",
      timestamp: "2024-01-12 14:20:00",
      severity: "warning",
    },
    {
      id: 4,
      type: "failed_login",
      user: "Unknown",
      action: "Failed login attempt from IP 192.168.1.100",
      timestamp: "2024-01-12 14:15:00",
      severity: "error",
    },
    {
      id: 5,
      type: "doctor_registration",
      user: "Dr. Michael Brown",
      action: "New doctor account created",
      timestamp: "2024-01-12 14:10:00",
      severity: "info",
    },
  ];

  const userManagement = [
    {
      id: 1,
      name: "Dr. Sarah Smith",
      role: "Doctor",
      status: "active",
      lastLogin: "2024-01-12 14:30:00",
      patients: 45,
    },
    {
      id: 2,
      name: "John Doe",
      role: "Patient",
      status: "active",
      lastLogin: "2024-01-12 14:25:00",
      appointments: 3,
    },
    {
      id: 3,
      name: "Dr. Michael Brown",
      role: "Doctor",
      status: "pending",
      lastLogin: "Never",
      patients: 0,
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "error":
        return "text-red-600 bg-red-50";
      case "warning":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-healthcare-blue bg-healthcare-blue-light";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "error":
        return <AlertTriangle className="h-4 w-4" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
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
                System Overview and Management - CloudClinic
              </p>
            </div>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              System Settings
            </Button>
          </div>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {systemStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-healthcare-text-secondary">{stat.label}</p>
                    <p className="text-2xl font-bold text-healthcare-text-primary">{stat.value}</p>
                    <p className={`text-sm ${stat.color}`}>{stat.change} from last month</p>
                  </div>
                  <div className={`p-3 rounded-full bg-healthcare-gray ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* System Activity Log */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-healthcare-blue" />
                  <span>System Activity Log</span>
                </CardTitle>
                <CardDescription>
                  Real-time monitoring of system events and user activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-healthcare-text-secondary h-4 w-4" />
                    <Input
                      placeholder="Search activity logs..."
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className={`flex items-start space-x-3 p-3 rounded-lg border ${getSeverityColor(activity.severity)}`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getSeverityIcon(activity.severity)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-healthcare-text-primary">
                            {activity.user}
                          </p>
                          <p className="text-xs text-healthcare-text-secondary">
                            {activity.timestamp}
                          </p>
                        </div>
                        <p className="text-sm text-healthcare-text-secondary">
                          {activity.action}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <Button variant="outline" size="sm">
                    Load More
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Log
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* User Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-healthcare-green" />
                  <span>User Management</span>
                </CardTitle>
                <CardDescription>
                  Manage system users, roles, and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userManagement.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border border-healthcare-gray rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-healthcare-blue-light p-2 rounded-full">
                          {user.role === "Doctor" ? (
                            <Users className="h-4 w-4 text-healthcare-green" />
                          ) : (
                            <Users className="h-4 w-4 text-healthcare-blue" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-healthcare-text-primary">
                            {user.name}
                          </h4>
                          <p className="text-sm text-healthcare-text-secondary">
                            {user.role} • Last login: {user.lastLogin}
                          </p>
                          <p className="text-sm text-healthcare-text-secondary">
                            {user.role === "Doctor" 
                              ? `${user.patients} patients` 
                              : `${user.appointments} appointments`
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={user.status === "active" ? "default" : "secondary"}
                          className={user.status === "active" ? "bg-healthcare-green" : "bg-yellow-500"}
                        >
                          {user.status}
                        </Badge>
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Security Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-healthcare-blue" />
                  <span>Security Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-healthcare-text-secondary">Active Sessions</span>
                  <span className="text-lg font-semibold text-healthcare-green">89</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-healthcare-text-secondary">Failed Logins (24h)</span>
                  <span className="text-lg font-semibold text-yellow-500">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-healthcare-text-secondary">Blocked IPs</span>
                  <span className="text-lg font-semibold text-red-500">3</span>
                </div>
                <div className="pt-4 border-t">
                  <Button variant="outline" size="sm" className="w-full">
                    <Shield className="h-4 w-4 mr-2" />
                    Security Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-healthcare-green" />
                  <span>System Health</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-healthcare-text-secondary">Database</span>
                    <Badge className="bg-healthcare-green">Healthy</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-healthcare-text-secondary">API Server</span>
                    <Badge className="bg-healthcare-green">Healthy</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-healthcare-text-secondary">File Storage</span>
                    <Badge className="bg-healthcare-green">Healthy</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-healthcare-text-secondary">Backup System</span>
                    <Badge className="bg-yellow-500">Warning</Badge>
                  </div>
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
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Security Audit
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  System Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
