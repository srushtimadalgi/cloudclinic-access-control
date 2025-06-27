
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Calendar, Shield, User, ArrowRight } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-healthcare-blue-light to-white py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto mb-8">
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
            
            <h1 className="text-4xl lg:text-6xl font-bold text-healthcare-text-primary mb-6">
              Your Health,{" "}
              <span className="text-healthcare-blue">Your Control</span>
            </h1>
            <p className="text-xl text-healthcare-text-secondary mb-12 max-w-2xl mx-auto">
              CloudClinic connects patients and doctors through a secure, modern platform. 
              Book appointments and manage your healthcare with complete privacy control.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-md mx-auto">
            <Link to="/signup" className="flex-1">
              <Button size="lg" className="bg-healthcare-blue hover:bg-healthcare-blue/90 w-full">
                <Calendar className="h-5 w-5 mr-2" />
                Book Appointment
              </Button>
            </Link>
            <Link to="/login" className="flex-1">
              <Button variant="outline" size="lg" className="w-full">
                <User className="h-5 w-5 mr-2" />
                Login
                <ArrowRight className="h-5 w-5 ml-2" />
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
