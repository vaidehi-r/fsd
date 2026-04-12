import { create } from 'zustand';
import api from '../lib/axios';
import axios from 'axios';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  accessToken: null,

  /**
   * Set access token in memory (never in localStorage).
   */
  setAccessToken: (token) => set({ accessToken: token }),

  /**
   * Login user — stores tokens in memory and cookies.
   */
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    set({
      user: res.data.user,
      isAuthenticated: true,
      accessToken: res.data.accessToken,
    });
    return res.data;
  },

  /**
   * Register user.
   */
  register: async (data) => {
    const res = await api.post('/auth/register', data);
    set({
      user: res.data.user,
      isAuthenticated: true,
      accessToken: res.data.accessToken,
    });
    return res.data;
  },

  /**
   * Fetch current user profile (on app load or after refresh).
   */
  fetchMe: async () => {
    try {
      set({ isLoading: true });
      const res = await api.get('/auth/me');
      set({
        user: res.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        accessToken: null,
      });
    }
  },

  logout: async () => {
    // Clear state immediately to break UI loops
    set({
      user: null,
      isAuthenticated: false,
      accessToken: null,
    });
    try {
      // Use raw axios to prevent interceptor infinite loops
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
      // Ignore logout errors
    }
  },

  /**
   * Update user in store (after profile edit).
   */
  updateUser: (updatedUser) => set({ user: updatedUser }),
}));

export default useAuthStore;
