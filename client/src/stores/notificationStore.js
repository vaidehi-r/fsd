import { create } from 'zustand';
import api from '../lib/axios';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,

  /**
   * Fetch notifications from API.
   */
  fetchNotifications: async () => {
    try {
      const res = await api.get('/notifications');
      set({
        notifications: res.data.notifications,
        unreadCount: res.data.unreadCount,
      });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  },

  /**
   * Mark all notifications as read.
   */
  markAllRead: async () => {
    try {
      await api.put('/notifications/read-all');
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Failed to mark all read:', error);
    }
  },

  /**
   * Mark a single notification as read.
   */
  markOneRead: async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error('Failed to mark notification read:', error);
    }
  },

  /**
   * Add a new notification (from socket event).
   */
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
}));

export default useNotificationStore;
