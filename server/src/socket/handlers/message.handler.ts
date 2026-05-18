import { Server } from 'socket.io';
import { SocketWithUser } from '../../types/socket';
import { messagesService } from '../../services/message.service';
import { ReplyTo, SendMessageData } from '../../types/message';
import { onlineUsers } from '../../state/onlineUsers';

function emitPrivateEvent(
  io: Server,
  socket: SocketWithUser,
  message: { senderId: string; receiverId?: string | null },
  event: string,
  payload: unknown,
) {
  socket.emit(event, payload);

  const peerId =
    message.senderId === socket.user.id
      ? message.receiverId
      : message.senderId;

  if (!peerId) {
    return;
  }

  const peerSocket = onlineUsers.get(peerId);

  if (peerSocket) {
    io.to(peerSocket.socketId).emit(event, payload);
  }
}

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
      replyTo: data.replyTo ?? null,
    });

    io.emit('receive_message', message);
  });

  socket.on(
    'room:message:send',
    async (data: {
      roomId: string;
      text: string;
      replyTo?: ReplyTo | null;
    }) => {
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
        replyTo: data.replyTo ?? null,
      });

      io.to(data.roomId).emit('room:message:receive', message);
    },
  );

  socket.on(
    'private:send',
    async (data: {
      receiverId: string;
      text: string;
      replyTo?: ReplyTo | null;
    }) => {
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
        replyTo: data.replyTo ?? null,
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
        emitPrivateEvent(io, socket, message, 'message:edited', message);
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
      emitPrivateEvent(io, socket, message, 'message:deleted', message);
    }
  });

  socket.on('message:pin', async (data: { messageId: string }) => {
    const message = await messagesService.pinMessage(data.messageId);

    if (!message) {
      return;
    }

    if (message.type === 'global') {
      io.emit('message:pinned', message);
    } else if (message.type === 'room' && message.roomId) {
      io.to(message.roomId.toString()).emit('message:pinned', message);
    } else if (message.type === 'private') {
      emitPrivateEvent(io, socket, message, 'message:pinned', message);
    }
  });

  socket.on('message:unpin', async (data: { messageId: string }) => {
    const message = await messagesService.unpinMessage(data.messageId);

    if (!message) {
      return;
    }

    if (message.type === 'global') {
      io.emit('message:unpinned', message);
    } else if (message.type === 'room' && message.roomId) {
      io.to(message.roomId.toString()).emit('message:unpinned', message);
    } else if (message.type === 'private') {
      emitPrivateEvent(io, socket, message, 'message:unpinned', message);
    }
  });

  socket.on('message:delete:me', async (data: { messageId: string }) => {
    await messagesService.deleteMessageForMe(data.messageId, socket.user.id);

    socket.emit('message:deleted:me', { messageId: data.messageId });
  });
}
