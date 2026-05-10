import { Server, Socket } from 'socket.io';
import { SocketWithUser } from '../../types/socket';
import { messagesService } from '../../services/message.service';
import { SendMessageData } from '../../types/message';

export function messageHandler(io: Server, socket: SocketWithUser) {
  socket.on('send_message', async (data: SendMessageData) => {
    const text = data.text.trim();

    if (!text) return;

    const message = await messagesService.createMessage({
      text,
      senderId: socket.user.id,
      senderUsername: socket.user.username,
    });

    io.emit('receive_message', message);
  });
}