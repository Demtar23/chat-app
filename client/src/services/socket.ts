import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;
let getToken: (() => string | null) | null = null;

export function setTokenGetter(fn: () => string | null) {
  getToken = fn;
}


export function connectSocket(token: string): Socket {
  if (socket?.connected) {
    return socket;
  }

  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  socket = io(import.meta.env.VITE_BACKEND_URL, {
    transports: ['websocket', 'polling'],
    withCredentials: true,
    auth: {
      token,
    },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  socket.on('reconnect_attempt', () => {
    const currentToken = getToken?.();
    if (currentToken && socket) {
      socket.auth = { token: currentToken };
    }
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
