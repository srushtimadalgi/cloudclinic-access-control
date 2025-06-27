
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Users,
  Shield,
} from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    userType: "patient",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Contact form submitted:", formData);
    alert("Thank you for your message! We'll get back to you within 24 hours.");
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
      userType: "patient",
    });
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone Support",
      details: "1-800-CLINIC-1",
      description: "Available 24/7 for urgent medical questions",
      color: "text-healthcare-blue",
    },
    {
      icon: Mail,
      title: "Email Support",
      details: "support@cloudclinic.com",
      description: "We respond within 2 hours during business hours",
      color: "text-healthcare-green",
    },
    {
      icon: MapPin,
      title: "Service Areas",
      details: "Nationwide Coverage",
      description: "Available in all 50 states",
      color: "text-healthcare-text-primary",
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: "Mon-Fri: 8AM-8PM EST",
      description: "Emergency support available 24/7",
      color: "text-healthcare-blue",
    },
  ];

  const supportCategories = [
    {
      icon: Users,
      title: "Patient Support",
      description: "Help with appointments, records, and account management",
      topics: ["Booking appointments", "Viewing health records", "Privacy settings", "Account issues"],
    },
    {
      icon: Shield,
      title: "Doctor Support",
      description: "Assistance for healthcare providers using our platform",
      topics: ["Patient record access", "Prescription uploads", "Account verification", "Technical issues"],
    },
    {
      icon: MessageSquare,
      title: "Technical Support",
      description: "Help with platform functionality and troubleshooting",
      topics: ["Login problems", "System errors", "Browser compatibility", "Mobile app issues"],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-healthcare-blue-light py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-healthcare-text-primary mb-6">
            Contact Our Support Team
          </h1>
          <p className="text-xl text-healthcare-text-secondary max-w-3xl mx-auto">
            We're here to help you with any questions about CloudClinic. Our dedicated support team 
            is available to assist patients, doctors, and healthcare administrators.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Send className="h-5 w-5 text-healthcare-blue" />
                  <span>Send Us a Message</span>
                </CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userType">I am a...</Label>
                    <select
                      id="userType"
                      className="w-full p-2 border border-healthcare-gray rounded-md"
                      value={formData.userType}
                      onChange={(e) => setFormData({...formData, userType: e.target.value})}
                    >
                      <option value="patient">Patient</option>
                      <option value="doctor">Healthcare Provider</option>
                      <option value="admin">Healthcare Administrator</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      type="text"
                      placeholder="Brief description of your inquiry"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Please provide details about your question or issue..."
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-healthcare-blue hover:bg-healthcare-blue/90"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Get in touch with our support team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full bg-healthcare-gray ${info.color}`}>
                      <info.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-healthcare-text-primary">
                        {info.title}
                      </h4>
                      <p className="text-sm font-semibold text-healthcare-text-primary">
                        {info.details}
                      </p>
                      <p className="text-sm text-healthcare-text-secondary">
                        {info.description}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emergency Support</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">
                    Medical Emergency?
                  </h4>
                  <p className="text-sm text-red-700 mb-3">
                    If you're experiencing a medical emergency, please call 911 immediately. 
                    CloudClinic support is not for emergency medical situations.
                  </p>
                  <Button variant="destructive" size="sm" className="w-full">
                    Call 911
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Support Categories */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-healthcare-text-primary mb-4">
              How Can We Help You?
            </h2>
            <p className="text-lg text-healthcare-text-secondary">
              Choose your support category for faster assistance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {supportCategories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="bg-healthcare-blue-light p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <category.icon className="h-6 w-6 text-healthcare-blue" />
                  </div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.topics.map((topic, topicIndex) => (
                      <li key={topicIndex} className="text-sm text-healthcare-text-secondary flex items-center">
                        <div className="w-1 h-1 bg-healthcare-blue rounded-full mr-2"></div>
                        {topic}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
