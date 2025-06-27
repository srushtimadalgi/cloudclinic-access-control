
import { Link } from "react-router-dom";
import { Shield, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-healthcare-text-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-healthcare-blue p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">CloudClinic</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Secure, modern healthcare platform connecting patients and doctors. 
              Book appointments, manage health records, and control your medical data privacy.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-white transition-colors">
                  Patient Login
                </Link>
              </li>
              <li>
                <Link to="/doctor-login" className="text-gray-300 hover:text-white transition-colors">
                  Doctor Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-healthcare-blue" />
                <span className="text-gray-300">1-800-CLINIC-1</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-healthcare-blue" />
                <span className="text-gray-300">support@cloudclinic.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-healthcare-blue" />
                <span className="text-gray-300">Available Nationwide</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            © 2024 CloudClinic. All rights reserved. HIPAA Compliant Healthcare Platform.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
