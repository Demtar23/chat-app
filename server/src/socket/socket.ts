import { Server } from 'socket.io';
import { socketAuth } from './socketAuth';
import { AuthenticatedSocket } from '../types/socket';

export function initSocket(io: Server) {
  io.use(socketAuth);

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.user?.username}`);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user?.username}`);
    });
  });
}
