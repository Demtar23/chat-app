import { Server } from 'socket.io';
import { SocketWithUser } from '../../types/socket';
import { roomsService } from '../../services/room.service';

export function roomHandler(io: Server, socket: SocketWithUser) {
  socket.on('room:join', async (roomId: string) => {
    const room = await roomsService.getRoomById(roomId);

    if (!room) {
      socket.emit('room:error', {
        message: 'Room not found',
      });

      return;
    }

    const isMember = await roomsService.isRoomMember(roomId, socket.user.id);

    if (!isMember) {
      socket.emit('room:error', {
        message: 'Not a member of this room',
      });

      return;
    }

    await socket.join(roomId);

    socket.emit('room:joined', room);
  });

  socket.on('room:created', (room) => {
    socket.broadcast.emit('room:created', room);
  });

  socket.on('room:leave', async (roomId: string) => {
    await socket.leave(roomId);

    socket.emit('room:left', { roomId });
  });
}
