import { ExtendedError, Socket } from 'socket.io';
import { SocketWithUser } from '../types/socket';
import { jwt } from '../utils/jwt';

export function socketAuth(
  socket: Socket,
  next: (err?: ExtendedError) => void,
) {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Unauthorized'));
  }

  const user = jwt.validateAccessToken(token);

  if (!user) {
    return next(new Error('Invalid token'));
  }

  (socket as SocketWithUser).user = {
    id: user.id,
    username: user.username,
  };

  next();
}
