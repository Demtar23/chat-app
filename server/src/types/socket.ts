import { Socket } from 'socket.io';

export type UserPayload = {
  id: string;
  username: string;
};

export interface SocketWithUser extends Socket {
  user: UserPayload;
}
