import { Server } from 'socket.io';
import { SocketWithUser } from '../../types/socket';
import { messagesService } from '../../services/message.service';
import { onlineUsers } from '../../state/onlineUsers';

export function statusHandler(io: Server, socket: SocketWithUser) {
  socket.on('messages:seen', async (senderId: string) => {
  console.log('messages:seen received', { senderId, receiverId: socket.user.id });
  
  await messagesService.markMessagesAsSeen(senderId, socket.user.id);

  const senderSocket = onlineUsers.get(senderId);
  console.log('senderSocket:', senderSocket);
  
  if (senderSocket) {
    io.to(senderSocket.socketId).emit('messages:seen', {
      by: socket.user.id,
      from: senderId,
    });
    console.log('messages:seen emitted to sender');
  }
});
}
