
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import Navigation from "@/components/Navigation";
import { Shield, User, Stethoscope, Settings } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, user, loading } = useAuth();
  const { data: profile } = useProfile();

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect authenticated users to appropriate dashboard
  useEffect(() => {
    if (user && profile && !loading) {
      console.log('Redirecting user with role:', profile.role);
      switch (profile.role) {
        case 'patient':
          navigate('/patient-dashboard');
          break;
        case 'doctor':
          navigate('/doctor-dashboard');
          break;
        case 'admin':
          navigate('/admin-dashboard');
          break;
        default:
          navigate('/');
      }
    }
  }, [user, profile, loading, navigate]);

  const handleLogin = async (e: React.FormEvent, userType: string) => {
    e.preventDefault();
    
    if (!loginForm.email || !loginForm.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await signIn(loginForm.email, loginForm.password);

      if (error) {
        console.error('Login error:', error);
        toast({
          title: "Login Failed",
          description: error.message || "Invalid email or password",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success!",
          description: `Welcome back! Redirecting to your ${userType} dashboard...`,
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
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
      
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-healthcare-blue p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-healthcare-text-primary mb-2">
              Welcome Back
            </h2>
            <p className="text-healthcare-text-secondary">
              Sign in to your CloudClinic account
            </p>
          </div>

          <Tabs defaultValue="patient" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="patient" className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Patient</span>
              </TabsTrigger>
              <TabsTrigger value="doctor" className="flex items-center space-x-1">
                <Stethoscope className="h-4 w-4" />
                <span className="hidden sm:inline">Doctor</span>
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center space-x-1">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </TabsTrigger>
            </TabsList>

            {/* Patient Login */}
            <TabsContent value="patient">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-healthcare-blue" />
                    <span>Patient Login</span>
                  </CardTitle>
                  <CardDescription>
                    Access your health records and manage appointments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => handleLogin(e, 'patient')} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="patient-email">Email Address</Label>
                      <Input
                        id="patient-email"
                        type="email"
                        placeholder="Enter your email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patient-password">Password</Label>
                      <Input
                        id="patient-password"
                        type="password"
                        placeholder="Enter your password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-healthcare-blue hover:bg-healthcare-blue/90"
                      disabled={isSubmitting || loading}
                    >
                      {isSubmitting ? "Signing In..." : "Sign In as Patient"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Doctor Login */}
            <TabsContent value="doctor">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Stethoscope className="h-5 w-5 text-healthcare-green" />
                    <span>Doctor Login</span>
                  </CardTitle>
                  <CardDescription>
                    Access patient records and manage prescriptions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => handleLogin(e, 'doctor')} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="doctor-email">Email Address</Label>
                      <Input
                        id="doctor-email"
                        type="email"
                        placeholder="Enter your email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doctor-password">Password</Label>
                      <Input
                        id="doctor-password"
                        type="password"
                        placeholder="Enter your password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-healthcare-green hover:bg-healthcare-green/90"
                      disabled={isSubmitting || loading}
                    >
                      {isSubmitting ? "Signing In..." : "Sign In as Doctor"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Admin Login */}
            <TabsContent value="admin">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5 text-healthcare-text-primary" />
                    <span>Admin Login</span>
                  </CardTitle>
                  <CardDescription>
                    System administration and audit logs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => handleLogin(e, 'admin')} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-email">Email Address</Label>
                      <Input
                        id="admin-email"
                        type="email"
                        placeholder="Enter your email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-password">Password</Label>
                      <Input
                        id="admin-password"
                        type="password"
                        placeholder="Enter your password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-healthcare-text-primary hover:bg-healthcare-text-primary/90"
                      disabled={isSubmitting || loading}
                    >
                      {isSubmitting ? "Signing In..." : "Sign In as Admin"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <p className="text-healthcare-text-secondary">
              Don't have an account?{" "}
              <Link to="/signup" className="text-healthcare-blue hover:underline font-medium">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
