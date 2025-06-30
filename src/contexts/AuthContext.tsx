
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { cleanupAuthState } from '@/utils/authCleanup';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: SignUpData) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

interface SignUpData {
  firstName: string;
  lastName: string;
  role: 'patient' | 'doctor' | 'admin';
  licenseNumber?: string;
  specialty?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Then get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: SignUpData) => {
    try {
      cleanupAuthState();
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: userData.role,
            license_number: userData.licenseNumber,
            specialty: userData.specialty,
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        return { error };
      }

      // If user is a doctor, create doctor record after profile is created
      if (userData.role === 'doctor' && data.user && userData.licenseNumber && userData.specialty) {
        setTimeout(async () => {
          const { error: doctorError } = await supabase
            .from('doctors')
            .insert({
              id: data.user!.id,
              license_number: userData.licenseNumber!,
              specialty: userData.specialty!,
            });
          
          if (doctorError) {
            console.error('Doctor record creation error:', doctorError);
          }
        }, 2000);
      }

      return { error: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      cleanupAuthState();
      
      // Special handling for admin login
      if (email === 'nishantus.btech23@rvu.edu.in') {
        // For admin, we'll create a session manually since they might not be in auth.users
        const { data: adminProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email)
          .eq('role', 'admin')
          .single();

        if (profileError || !adminProfile) {
          return { error: { message: 'Admin profile not found' } };
        }

        // Try to sign in normally first
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // If normal sign in fails, try to create the admin user
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                first_name: adminProfile.first_name,
                last_name: adminProfile.last_name,
                role: 'admin'
              }
            }
          });

          if (signUpError) {
            return { error: signUpError };
          }

          // Try to sign in again after creating the user
          const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (retryError) {
            return { error: retryError };
          }

          if (retryData.user) {
            setTimeout(() => {
              window.location.href = '/admin-dashboard';
            }, 100);
          }

          return { error: null };
        }

        if (data.user) {
          setTimeout(() => {
            window.location.href = '/admin-dashboard';
          }, 100);
        }

        return { error: null };
      }

      // Normal sign in for other users
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.log('Global signout failed, continuing...');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }

      if (data.user) {
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      }

      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      cleanupAuthState();
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        console.error('Sign out error:', error);
      }
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
