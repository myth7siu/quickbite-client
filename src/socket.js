import { io } from 'socket.io-client';

const URL = import.meta.env.DEV ? '' : window.location.origin;

const socket = io(URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

socket.on('connect', () => {
  console.log('🔌 Socket connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('❌ Socket disconnected:', reason);
});

socket.on('connect_error', (err) => {
  console.warn('⚠️ Socket connection error:', err.message);
});

export default socket;
