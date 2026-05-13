import { Server } from 'socket.io';
import { SocketWithUser } from '../../types/socket';
import { messagesService } from '../../services/message.service';
import { onlineUsers } from '../../state/onlineUsers';

export function reactionHandler(io: Server, socket: SocketWithUser) {
  socket.on(
    'reaction:toggle',
    async (data: { messageId: string; emoji: string }) => {
      const message = await messagesService.toggleReaction(
        data.messageId,
        data.emoji,
        socket.user.id,
      );

      if (!message) {
        return;
      }

      if (message.type === 'global') {
        io.emit('reaction:updated', message);
      } else if (message.type === 'room' && message.roomId) {
        io.to(message.roomId.toString()).emit('reaction:updated', message);
      } else if (message.type === 'private') {
        socket.emit('reaction:updated', message);

        if (message.receiverId) {
          const receiverSocket = onlineUsers.get(message.receiverId);
          if (receiverSocket) {
            io.to(receiverSocket.socketId).emit('reaction:updated', message);
          }
        }
      }
    },
  );
}
