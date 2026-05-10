import { Server } from 'socket.io';
import { socketAuth } from './socketAuth';
import { AuthenticatedSocket } from '../types/socket';
import { onlineUsers } from '../state/onlineUsers';

export function initSocket(io: Server) {
  io.use(socketAuth);

  io.on('connection', (socket: AuthenticatedSocket) => {
    if (!socket.user) {
      return;
    }

    onlineUsers.set(socket.user.id, {
      userId: socket.user.id,
      userName: socket.user.username,
      socketId: socket.id,
    });

    io.emit('online_users', Array.from(onlineUsers.values()));

    console.log('Online users:', Array.from(onlineUsers.values()));

    socket.on('disconnect', () => {
      onlineUsers.delete(socket.user!.id);

      io.emit('online_users', Array.from(onlineUsers.values()));

      console.log('Online users', Array.from(onlineUsers.values()));
    });
  });
}
