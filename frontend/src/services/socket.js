import { io } from 'socket.io-client';

let socket = null;

export const initSocket = (token) => {
  if (!socket && token) {
    const backendUrl = import.meta.env.VITE_API_URL || '';
    // If backendUrl is relative (e.g. empty or starts with /), io() defaults to window.location.origin
    socket = io(backendUrl || undefined, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('Connected to WebSocket server:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err.message);
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Disconnected from WebSocket server');
  }
};

export const getSocket = () => socket;