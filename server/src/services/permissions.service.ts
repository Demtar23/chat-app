import { roomsService } from './room.service';
import { messagesService } from './message.service';
import { ForbiddenError, NotFoundError } from '../errors/AppError';

async function assertRoomMember(roomId: string, userId: string) {
  const room = await roomsService.getRoomById(roomId);
  if (!room) throw new NotFoundError('Room not found');
  if (!room.members.includes(userId)) {
    throw new ForbiddenError('You are not a member of this room');
  }
  return room;
}

async function assertRoomOwner(roomId: string, userId: string) {
  const room = await roomsService.getRoomById(roomId);
  if (!room) throw new NotFoundError('Room not found');
  if (room.createdBy !== userId) {
    throw new ForbiddenError('Only room owner can perform this action');
  }
  return room;
}

async function assertMessageOwner(messageId: string, userId: string) {
  const message = await messagesService.getMessageById(messageId);
  if (!message) throw new NotFoundError('Message not found');
  if (message.senderId !== userId) {
    throw new ForbiddenError('Only message owner can perform this action');
  }
  return message;
}

function canAccessPrivateChat(userId: string, peerId: string): boolean {
  return userId !== peerId;
}

export const permissionsService = {
  assertRoomMember,
  assertRoomOwner,
  assertMessageOwner,
  canAccessPrivateChat,
};
