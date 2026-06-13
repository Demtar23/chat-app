import { Server } from 'socket.io';
import { socketAuth } from './socketAuth';
import { onlineUsers } from '../state/onlineUsers';
import { SocketWithUser } from '../types/socket';
import { messageHandler } from './handlers/message.handler';
import { typingHandler } from './handlers/typing.handler';
import { roomHandler } from './handlers/room.handler';
import { reactionHandler } from './handlers/reaction.handler';
import { messagesService } from '../services/message.service';
import { statusHandler } from './handlers/status.handler';
import { userService } from '../services/user.service';
import { userHandler } from './handlers/user.handler';

export function initSocket(io: Server) {
  io.use(socketAuth);

  io.on('connection', async (socket) => {
    const authSocket = socket as SocketWithUser;

    const user = authSocket.user;

    if (!user) {
      return;
    }

    console.log('[CONNECT]', user.id, user.username, authSocket.id);

    await messagesService.markAsDelivered(user.id);

    onlineUsers.set(user.id, {
      userId: user.id,
      userName: user.username,
      socketId: authSocket.id,
    });

    console.log('[ONLINE AFTER CONNECT]', Array.from(onlineUsers.values()));

    io.emit('online_users', Array.from(onlineUsers.values()));

    messageHandler(io, authSocket);
    typingHandler(io, authSocket);
    roomHandler(io, authSocket);
    reactionHandler(io, authSocket);
    statusHandler(io, authSocket);
    userHandler(io, authSocket);

    socket.on('users:get', () => {
      socket.emit('online_users', Array.from(onlineUsers.values()));
    });

    socket.on('online_users:request', () => {
      socket.emit('online_users', Array.from(onlineUsers.values()));
    });

    socket.on('disconnect', async (reason) => {
      console.log(
        '[DISCONNECT]',
        user.id,
        user.username,
        authSocket.id,
        reason,
      );

      console.log('[MAP ENTRY BEFORE DELETE]', onlineUsers.get(user.id));

      console.log('[ONLINE BEFORE DELETE]', Array.from(onlineUsers.values()));
      onlineUsers.delete(user.id);

      console.log('[ONLINE AFTER DELETE]', Array.from(onlineUsers.values()));

      io.emit('online_users', Array.from(onlineUsers.values()));

      await userService.updateLastSeen(user.id);
    });
  });
}
