
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      // Mock notifications for now since types aren't updated
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'Welcome to CloudClinic',
          message: 'Your account has been successfully created.',
          type: 'info',
          read: false,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Appointment Reminder',
          message: 'You have an upcoming appointment tomorrow at 10:00 AM.',
          type: 'appointment',
          read: false,
          created_at: new Date(Date.now() - 86400000).toISOString()
        }
      ];
      
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return {
    notifications,
    loading,
    markAsRead,
    refetch: loadNotifications
  };
};
