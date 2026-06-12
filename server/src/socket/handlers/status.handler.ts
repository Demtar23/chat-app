import { Server } from 'socket.io';
import { SocketWithUser } from '../../types/socket';
import { messagesService } from '../../services/message.service';
import { onlineUsers } from '../../state/onlineUsers';

export function statusHandler(io: Server, socket: SocketWithUser) {
  socket.on('messages:seen', async (senderId: string) => {
  
  await messagesService.markMessagesAsSeen(senderId, socket.user.id);

  const senderSocket = onlineUsers.get(senderId);
  
  if (senderSocket) {
    io.to(senderSocket.socketId).emit('messages:seen', {
      by: socket.user.id,
      from: senderId,
    });
  }
});
}
