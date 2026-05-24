import { Server } from 'socket.io';
import { SocketWithUser } from '../../types/socket';
import { userService } from '../../services/user.service';

export function userHandler(io: Server, socket: SocketWithUser) {
  socket.on('user:update', async (data: { bio?: string; avatar?: string }) => {
    const userId = socket.user.id;

    const updatedUser = await userService.updateUser(userId, data);

    if (!updatedUser) {
      return;
    }

    io.emit('user:updated', {
      _id: updatedUser._id.toString(),
      username: updatedUser.username,
      bio: updatedUser.bio,
      avatar: updatedUser.avatar,
      lastSeen: updatedUser.lastSeen,
      bannerColor: updatedUser.bannerColor,
      updatedAt: updatedUser.updatedAt,
      createdAt: updatedUser.createdAt,
    });
  });
}
