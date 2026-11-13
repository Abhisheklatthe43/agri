import { apiRequest } from './api';

export const notificationService = {
  getNotifications: async () => {
    const res = await apiRequest('/notifications');
    return res.data || [];
  },

  markAsRead: async (id) => {
    const res = await apiRequest(`/notifications/${id}/read`, {
      method: 'PATCH'
    });
    return res.data;
  }
};
