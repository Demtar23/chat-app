import { ExtendedError } from 'socket.io';
import { AuthenticatedSocket } from '../types/socket';
import { jwt } from '../utils/jwt';

export function socketAuth(
  socket: AuthenticatedSocket,
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

  socket.user = {
    id: user.id,
    username: user.username,
  };

  next();
}
