import { Server } from 'socket.io';
import { SocketWithUser } from '../../types/socket';
import { messagesService } from '../../services/message.service';
import { SendMessageData } from '../../types/message';
import { onlineUsers } from '../../state/onlineUsers';

export function messageHandler(io: Server, socket: SocketWithUser) {
  socket.on('send_message', async (data: SendMessageData) => {
    const text = data.text.trim();

    if (!text) {
      return;
    }

    const message = await messagesService.createMessage({
      text,
      senderId: socket.user.id,
      senderUsername: socket.user.username,
      type: 'global',
    });

    io.emit('receive_message', message);
  });

  socket.on(
    'room:message:send',
    async (data: { roomId: string; text: string }) => {
      const text = data.text.trim();

      if (!text) {
        return;
      }

      const message = await messagesService.createMessage({
        text,
        senderId: socket.user.id,
        senderUsername: socket.user.username,
        type: 'room',
        roomId: data.roomId,
      });

      io.to(data.roomId).emit('room:message:receive', message);
    },
  );

  socket.on(
    'private:send',
    async (data: { receiverId: string; text: string }) => {
      const text = data.text.trim();

      if (!text) {
        return;
      }

      const message = await messagesService.createMessage({
        text,
        senderId: socket.user.id,
        senderUsername: socket.user.username,
        type: 'private',
        receiverId: data.receiverId,
      });

      socket.emit('private:receive', message);

      const receiverSocket = onlineUsers.get(data.receiverId);

      if (receiverSocket) {
        io.to(receiverSocket.socketId).emit('private:receive', message);
      }
    },
  );
}
