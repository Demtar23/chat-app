import { Server } from 'socket.io';
import { socketAuth } from './socketAuth';
import { onlineUsers } from '../state/onlineUsers';
import { SocketWithUser } from '../types/socket';
import { messageHandler } from './handlers/message.handler';
import { typingHandler } from './handlers/typing.handler';

export function initSocket(io: Server) {
  io.use(socketAuth);

  io.on('connection', (socket) => {
    const authSocket = socket as SocketWithUser;

    const user = authSocket.user;

    if (!user) {
      return;
    }

    onlineUsers.set(user.id, {
      userId: user.id,
      userName: user.username,
      socketId: authSocket.id,
    });

    io.emit('online_users', Array.from(onlineUsers.values()));

    console.log('Online users:', Array.from(onlineUsers.values()));

    messageHandler(io, authSocket);
    typingHandler(io, authSocket);

    socket.on('users:get', () => {
      socket.emit('online_users', Array.from(onlineUsers.values()));
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(user.id);

      io.emit('online_users', Array.from(onlineUsers.values()));

      console.log('Online users', Array.from(onlineUsers.values()));
    });
  });
}
