
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, Calendar, Shield, LogOut, Home } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();

  const isActive = (path: string) => location.pathname === path;

  // Dynamic navigation items based on user role
  const getNavItems = () => {
    if (!user || !profile) {
      return [{ href: "/home", label: "Home" }];
    }

    const baseItems = [{ href: "/home", label: "Home" }];

    switch (profile.role) {
      case 'patient':
        return [
          ...baseItems,
          { href: "/patient-dashboard", label: "Dashboard" }
        ];
      case 'doctor':
        return [
          ...baseItems,
          { href: "/doctor-dashboard", label: "Dashboard" }
        ];
      case 'admin':
        return [
          ...baseItems,
          { href: "/admin-dashboard", label: "Admin Dashboard" }
        ];
      default:
        return baseItems;
    }
  };

  const navItems = getNavItems();

  const handleLogout = async () => {
    await signOut();
  };

  const getRoleIcon = () => {
    switch (profile?.role) {
      case 'admin':
        return <Shield className="h-4 w-4 mr-2" />;
      case 'doctor':
        return <User className="h-4 w-4 mr-2" />;
      case 'patient':
        return <Calendar className="h-4 w-4 mr-2" />;
      default:
        return <User className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-healthcare-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to={user ? "/" : "/home"} className="flex items-center space-x-2">
              <div className="bg-healthcare-blue p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-healthcare-text-primary">
                CloudClinic
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "text-healthcare-blue"
                    : "text-healthcare-text-secondary hover:text-healthcare-text-primary"
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            <div className="flex items-center space-x-3">
              {user && profile ? (
                <div className="flex items-center space-x-3">
                  <div className="text-sm">
                    <span className="text-healthcare-text-secondary">Welcome, </span>
                    <span className="font-medium text-healthcare-text-primary">
                      {profile.role === 'doctor' ? 'Dr. ' : ''}{profile.first_name}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="outline" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button size="sm" className="bg-healthcare-blue hover:bg-healthcare-blue/90">
                      <Calendar className="h-4 w-4 mr-2" />
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-healthcare-gray">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`block px-3 py-2 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "text-healthcare-blue bg-healthcare-blue-light"
                      : "text-healthcare-text-secondary hover:text-healthcare-text-primary hover:bg-healthcare-gray"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="px-3 py-2 space-y-2">
                {user && profile ? (
                  <>
                    <div className="text-sm pb-2">
                      <span className="text-healthcare-text-secondary">Welcome, </span>
                      <span className="font-medium text-healthcare-text-primary">
                        {profile.role === 'doctor' ? 'Dr. ' : ''}{profile.first_name}
                      </span>
                    </div>
                    <Button variant="outline" className="w-full" onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        <User className="h-4 w-4 mr-2" />
                        Login
                      </Button>
                    </Link>
                    <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full bg-healthcare-blue hover:bg-healthcare-blue/90">
                        <Calendar className="h-4 w-4 mr-2" />
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
