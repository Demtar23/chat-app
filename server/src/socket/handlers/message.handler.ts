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

      const isReceiverOnline = onlineUsers.has(data.receiverId);

      const message = await messagesService.createMessage({
        text,
        senderId: socket.user.id,
        senderUsername: socket.user.username,
        type: 'private',
        receiverId: data.receiverId,
        status: isReceiverOnline ? 'delivered' : 'sent',
      });

      socket.emit('private:receive', message);

      const receiverSocket = onlineUsers.get(data.receiverId);

      if (receiverSocket) {
        io.to(receiverSocket.socketId).emit('private:receive', message);
      }
    },
  );

  socket.on(
    'message:edit',
    async (data: { messageId: string; text: string }) => {
      const text = data.text.trim();
      if (!text) {
        return;
      }

      const message = await messagesService.editMessage(
        data.messageId,
        text,
        socket.user.id,
      );

      if (!message) {
        return;
      }

      if (message.type === 'global') {
        io.emit('message:edited', message);
      } else if (message.type === 'room' && message.roomId) {
        io.to(message.roomId.toString()).emit('message:edited', message);
      } else if (message.type === 'private') {
        socket.emit('message:edited', message);
        const receiverSocket = onlineUsers.get(message.receiverId!);
        if (receiverSocket) {
          io.to(receiverSocket.socketId).emit('message:edited', message);
        }
      }
    },
  );

  socket.on('message:delete', async (data: { messageId: string }) => {
    const message = await messagesService.deleteMessageForAll(
      data.messageId,
      socket.user.id,
    );

    if (!message) {
      return;
    }

    if (message.type === 'global') {
      io.emit('message:deleted', message);
    } else if (message.type === 'room' && message.roomId) {
      io.to(message.roomId.toString()).emit('message:deleted', message);
    } else if (message.type === 'private') {
      socket.emit('message:deleted', message);
      const receiverSocket = onlineUsers.get(message.receiverId!);
      if (receiverSocket) {
        io.to(receiverSocket.socketId).emit('message:deleted', message);
      }
    }
  });

  socket.on('message:delete:me', async (data: { messageId: string }) => {
    await messagesService.deleteMessageForMe(data.messageId, socket.user.id);
    
    socket.emit('message:deleted:me', { messageId: data.messageId });
  });
}
