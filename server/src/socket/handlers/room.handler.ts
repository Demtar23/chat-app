import { Server } from 'socket.io';
import { SocketWithUser } from '../../types/socket';
import { permissionsService } from '../../services/permissions.service';

export function roomHandler(io: Server, socket: SocketWithUser) {
  socket.on('room:join', async (roomId: string) => {
    try {
      await permissionsService.assertRoomMember(roomId, socket.user.id);
      await socket.join(roomId);
      socket.emit('room:joined', { roomId });
    } catch (err) {
      socket.emit('room:error', {
        message: err instanceof Error ? err.message : 'Access denied',
      });
    }
  });

  socket.on('room:created', (room) => {
    socket.broadcast.emit('room:created', room);
  });

  socket.on('room:leave', async (roomId: string) => {
    await socket.leave(roomId);

    socket.emit('room:left', { roomId });
  });
}
