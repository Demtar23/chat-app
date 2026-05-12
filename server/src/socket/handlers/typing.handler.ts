import { Server, Socket } from 'socket.io';
import { SocketWithUser } from '../../types/socket';

export function typingHandler(io: Server, socket: SocketWithUser) {
  socket.on('typing:start', () => {
    socket.broadcast.emit('typing:update', {
      userId: socket.user.id,
      username: socket.user.username,
      isTyping: true,
    });
  });

  socket.on('typing:stop', () => {
    socket.broadcast.emit('typing:update', {
      userId: socket.user.id,
      username: socket.user.username,
      isTyping: false,
    });
  });
}
