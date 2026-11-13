import React, { createContext, useContext, useEffect, useState } from 'react';
import { notificationService } from '../services/notificationService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.warn('Failed to load notifications:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000); // Poll every minute
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [isAuthenticated]);

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      refreshNotifications: fetchNotifications,
      markAsRead
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
