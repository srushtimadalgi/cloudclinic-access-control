
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  Calendar,
  Shield,
  Users,
  Clock,
  CheckCircle,
  Star,
  ArrowRight,
} from "lucide-react";

const Home = () => {
  const features = [
    {
      icon: Calendar,
      title: "Easy Appointment Booking",
      description: "Schedule appointments with your preferred doctors instantly",
    },
    {
      icon: Shield,
      title: "Secure Health Records",
      description: "Your medical data is encrypted and protected with industry-leading security",
    },
    {
      icon: Users,
      title: "Access Control",
      description: "You decide who can view your health records and when",
    },
    {
      icon: Clock,
      title: "24/7 Access",
      description: "Access your health information anytime, anywhere",
    },
  ];

  const benefits = [
    "HIPAA compliant and secure",
    "Easy-to-use patient portal",
    "Real-time appointment scheduling",
    "Prescription management",
    "Access control for health records",
    "Multi-role dashboard system",
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-healthcare-blue-light to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-healthcare-text-primary mb-6">
                Your Health,{" "}
                <span className="text-healthcare-blue">Your Control</span>
              </h1>
              <p className="text-xl text-healthcare-text-secondary mb-8">
                CloudClinic connects patients and doctors through a secure, modern platform. 
                Book appointments, manage health records, and control who has access to your medical data.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup">
                  <Button size="lg" className="bg-healthcare-blue hover:bg-healthcare-blue/90 w-full sm:w-auto">
                    <Calendar className="h-5 w-5 mr-2" />
                    Book Appointment
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Patient Login
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="lg:text-center">
              <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto">
                <div className="bg-healthcare-blue-light rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-10 w-10 text-healthcare-blue" />
                </div>
                <h3 className="text-xl font-semibold text-healthcare-text-primary mb-2">
                  Secure & Private
                </h3>
                <p className="text-healthcare-text-secondary">
                  Your health data is protected with bank-level encryption and HIPAA compliance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-healthcare-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-healthcare-text-primary mb-4">
              Why Choose CloudClinic?
            </h2>
            <p className="text-xl text-healthcare-text-secondary max-w-3xl mx-auto">
              Experience healthcare management designed around your needs, with security and convenience at its core.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="bg-healthcare-blue-light rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-healthcare-blue" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-healthcare-text-secondary">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-healthcare-text-primary mb-6">
                Everything You Need for Modern Healthcare
              </h2>
              <p className="text-lg text-healthcare-text-secondary mb-8">
                CloudClinic provides a comprehensive platform that puts you in control of your healthcare journey.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-healthcare-green flex-shrink-0" />
                    <span className="text-healthcare-text-primary">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card className="bg-healthcare-blue text-white">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-6 w-6 mr-2" />
                    Patients
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Manage appointments, control health record access, and stay connected with your healthcare team.</p>
                </CardContent>
              </Card>
              <Card className="bg-healthcare-green text-white">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="h-6 w-6 mr-2" />
                    Doctors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Access patient records with permission, upload prescriptions, and manage your practice efficiently.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-healthcare-blue">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Take Control of Your Healthcare?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of patients and doctors already using CloudClinic for better healthcare management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                <Calendar className="h-5 w-5 mr-2" />
                Get Started Today
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-healthcare-blue w-full sm:w-auto">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
