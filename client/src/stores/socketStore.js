import { create } from 'zustand';
import { io } from 'socket.io-client';
import useNotificationStore from './notificationStore';
import useAuthStore from './authStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,

  /**
   * Initialize socket connection with JWT auth.
   */
  initSocket: () => {
    const { socket } = get();
    if (socket?.connected) return; // Already connected

    const token = useAuthStore.getState().accessToken;
    if (!token) return;

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      set({ isConnected: true });
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      set({ isConnected: false });
    });

    // Listen for real-time notifications
    newSocket.on('notification:new', (notification) => {
      useNotificationStore.getState().addNotification(notification);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    set({ socket: newSocket });
  },

  /**
   * Disconnect socket.
   */
  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },
}));

export default useSocketStore;
