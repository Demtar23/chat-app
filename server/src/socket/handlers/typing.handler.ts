import { Server, Socket } from 'socket.io';
import { SocketWithUser } from '../../types/socket';

export function typingHandler(io: Server, socket: SocketWithUser) {
  socket.on(
    'typing:start',
    (data: { type: string; roomId?: string; receiverId?: string }) => {
      if (!data?.type) {
        return;
      }

      socket.broadcast.emit('typing:update', {
        userId: socket.user.id,
        username: socket.user.username,
        isTyping: true,
        type: data.type,
        roomId: data.roomId,
        receiverId: data.receiverId,
      });
    },
  );

  socket.on(
    'typing:stop',
    (data: { type: string; roomId?: string; receiverId?: string }) => {
      if (!data?.type) {
        return;
      }

      socket.broadcast.emit('typing:update', {
        userId: socket.user.id,
        username: socket.user.username,
        isTyping: false,
        type: data.type,
        roomId: data.roomId,
        receiverId: data.receiverId,
      });
    },
  );
}
