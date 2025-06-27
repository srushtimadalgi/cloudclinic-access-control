
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import Navigation from "@/components/Navigation";
import { Shield, User, Stethoscope } from "lucide-react";

const Signup = () => {
  const [patientForm, setPatientForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [doctorForm, setDoctorForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    licenseNumber: "",
    specialty: "",
    agreeTerms: false,
  });

  const handlePatientSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (patientForm.password !== patientForm.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    console.log("Patient signup:", patientForm);
    // In a real app, this would create account and redirect
    alert("Account created successfully! Please check your email to verify your account.");
  };

  const handleDoctorSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (doctorForm.password !== doctorForm.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    console.log("Doctor signup:", doctorForm);
    // In a real app, this would create account and redirect
    alert("Doctor account submitted for verification. You'll receive an email once approved.");
  };

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
              Join CloudClinic
            </h2>
            <p className="text-healthcare-text-secondary">
              Create your secure healthcare account
            </p>
          </div>

          <Tabs defaultValue="patient" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="patient" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Patient</span>
              </TabsTrigger>
              <TabsTrigger value="doctor" className="flex items-center space-x-2">
                <Stethoscope className="h-4 w-4" />
                <span>Doctor</span>
              </TabsTrigger>
            </TabsList>

            {/* Patient Signup */}
            <TabsContent value="patient">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-healthcare-blue" />
                    <span>Patient Registration</span>
                  </CardTitle>
                  <CardDescription>
                    Sign up to book appointments and manage your health records
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePatientSignup} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="patient-firstName">First Name</Label>
                        <Input
                          id="patient-firstName"
                          type="text"
                          placeholder="John"
                          value={patientForm.firstName}
                          onChange={(e) => setPatientForm({...patientForm, firstName: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="patient-lastName">Last Name</Label>
                        <Input
                          id="patient-lastName"
                          type="text"
                          placeholder="Doe"
                          value={patientForm.lastName}
                          onChange={(e) => setPatientForm({...patientForm, lastName: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patient-email">Email Address</Label>
                      <Input
                        id="patient-email"
                        type="email"
                        placeholder="john@example.com"
                        value={patientForm.email}
                        onChange={(e) => setPatientForm({...patientForm, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patient-password">Password</Label>
                      <Input
                        id="patient-password"
                        type="password"
                        placeholder="Create a strong password"
                        value={patientForm.password}
                        onChange={(e) => setPatientForm({...patientForm, password: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patient-confirmPassword">Confirm Password</Label>
                      <Input
                        id="patient-confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={patientForm.confirmPassword}
                        onChange={(e) => setPatientForm({...patientForm, confirmPassword: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="patient-terms"
                        checked={patientForm.agreeTerms}
                        onCheckedChange={(checked) => setPatientForm({...patientForm, agreeTerms: checked as boolean})}
                      />
                      <Label htmlFor="patient-terms" className="text-sm">
                        I agree to the{" "}
                        <Link to="/terms" className="text-healthcare-blue hover:underline">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link to="/privacy" className="text-healthcare-blue hover:underline">
                          Privacy Policy
                        </Link>
                      </Label>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-healthcare-blue hover:bg-healthcare-blue/90"
                      disabled={!patientForm.agreeTerms}
                    >
                      Create Patient Account
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Doctor Signup */}
            <TabsContent value="doctor">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Stethoscope className="h-5 w-5 text-healthcare-green" />
                    <span>Doctor Registration</span>
                  </CardTitle>
                  <CardDescription>
                    Join our network of healthcare professionals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleDoctorSignup} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="doctor-firstName">First Name</Label>
                        <Input
                          id="doctor-firstName"
                          type="text"
                          placeholder="Dr. Jane"
                          value={doctorForm.firstName}
                          onChange={(e) => setDoctorForm({...doctorForm, firstName: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="doctor-lastName">Last Name</Label>
                        <Input
                          id="doctor-lastName"
                          type="text"
                          placeholder="Smith"
                          value={doctorForm.lastName}
                          onChange={(e) => setDoctorForm({...doctorForm, lastName: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doctor-email">Email Address</Label>
                      <Input
                        id="doctor-email"
                        type="email"
                        placeholder="doctor@example.com"
                        value={doctorForm.email}
                        onChange={(e) => setDoctorForm({...doctorForm, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doctor-license">Medical License Number</Label>
                      <Input
                        id="doctor-license"
                        type="text"
                        placeholder="License #"
                        value={doctorForm.licenseNumber}
                        onChange={(e) => setDoctorForm({...doctorForm, licenseNumber: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doctor-specialty">Specialty</Label>
                      <Input
                        id="doctor-specialty"
                        type="text"
                        placeholder="e.g., Cardiology"
                        value={doctorForm.specialty}
                        onChange={(e) => setDoctorForm({...doctorForm, specialty: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doctor-password">Password</Label>
                      <Input
                        id="doctor-password"
                        type="password"
                        placeholder="Create a strong password"
                        value={doctorForm.password}
                        onChange={(e) => setDoctorForm({...doctorForm, password: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doctor-confirmPassword">Confirm Password</Label>
                      <Input
                        id="doctor-confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={doctorForm.confirmPassword}
                        onChange={(e) => setDoctorForm({...doctorForm, confirmPassword: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="doctor-terms"
                        checked={doctorForm.agreeTerms}
                        onCheckedChange={(checked) => setDoctorForm({...doctorForm, agreeTerms: checked as boolean})}
                      />
                      <Label htmlFor="doctor-terms" className="text-sm">
                        I agree to the{" "}
                        <Link to="/terms" className="text-healthcare-blue hover:underline">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link to="/privacy" className="text-healthcare-blue hover:underline">
                          Privacy Policy
                        </Link>
                      </Label>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-healthcare-green hover:bg-healthcare-green/90"
                      disabled={!doctorForm.agreeTerms}
                    >
                      Submit Doctor Application
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <p className="text-healthcare-text-secondary">
              Already have an account?{" "}
              <Link to="/login" className="text-healthcare-blue hover:underline font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
