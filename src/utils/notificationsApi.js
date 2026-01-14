import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: `${API_URL}/notifications`,
  withCredentials: true,
});

export const notificationsApi = {
  // Get all notifications
  getNotifications: async () => {
    const response = await api.get('/');
    return response.data;
  },

  // Get unread count
  getUnreadCount: async () => {
    const response = await api.get('/unread-count');
    return response.data;
  },

  // Mark as read
  markAsRead: async (notificationId) => {
    const response = await api.put(`/${notificationId}/read`);
    return response.data;
  },

  // Mark all as read
  markAllAsRead: async () => {
    const response = await api.put('/mark-all-read');
    return response.data;
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    const response = await api.delete(`/${notificationId}`);
    return response.data;
  },

  // Delete all notifications
  deleteAll: async () => {
    const response = await api.delete('/');
    return response.data;
  },
};
