import mongoose from 'mongoose';
import { Room } from '../models/Room';
import { Message } from '../models/Message';
import { permissionsService } from '../services/permissions.service';
import './setup';

describe('permissionsService', () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const otherId = new mongoose.Types.ObjectId().toString();

  describe('assertRoomMember', () => {
    it('returns room if user is a member', async () => {
      const room = await Room.create({
        name: 'test-room',
        description: '',
        createdBy: userId,
        members: [userId],
      });
      const result = await permissionsService.assertRoomMember(
        room._id.toString(), userId,
      );
      expect(result._id.toString()).toBe(room._id.toString());
    });

    it('throws ForbiddenError if user is not a member', async () => {
      const room = await Room.create({
        name: 'test-room-2',
        description: '',
        createdBy: userId,
        members: [userId],
      });
      await expect(
        permissionsService.assertRoomMember(room._id.toString(), otherId),
      ).rejects.toThrow('You are not a member of this room');
    });

    it('throws NotFoundError if room does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      await expect(
        permissionsService.assertRoomMember(fakeId, userId),
      ).rejects.toThrow('Room not found');
    });
  });

  describe('assertRoomOwner', () => {
    it('returns room if user is the owner', async () => {
      const room = await Room.create({
        name: 'owned-room',
        description: '',
        createdBy: userId,
        members: [userId],
      });
      const result = await permissionsService.assertRoomOwner(
        room._id.toString(), userId,
      );
      expect(result.createdBy).toBe(userId);
    });

    it('throws ForbiddenError if user is not the owner', async () => {
      const room = await Room.create({
        name: 'not-owned-room',
        description: '',
        createdBy: userId,
        members: [userId, otherId],
      });
      await expect(
        permissionsService.assertRoomOwner(room._id.toString(), otherId),
      ).rejects.toThrow('Only room owner can perform this action');
    });
  });

  describe('assertMessageOwner', () => {
    it('returns message if user is the owner', async () => {
      const message = await Message.create({
        text: 'hello',
        senderId: userId,
        senderUsername: 'testuser',
        type: 'global',
      });
      const result = await permissionsService.assertMessageOwner(
        message._id.toString(), userId,
      );
      expect(result.senderId).toBe(userId);
    });

    it('throws ForbiddenError if user is not the owner', async () => {
      const message = await Message.create({
        text: 'hello',
        senderId: userId,
        senderUsername: 'testuser',
        type: 'global',
      });
      await expect(
        permissionsService.assertMessageOwner(message._id.toString(), otherId),
      ).rejects.toThrow('Only message owner can perform this action');
    });

    it('throws NotFoundError if message does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      await expect(
        permissionsService.assertMessageOwner(fakeId, userId),
      ).rejects.toThrow('Message not found');
    });
  });

  describe('canAccessPrivateChat', () => {
    it('returns true if users are different', () => {
      expect(permissionsService.canAccessPrivateChat(userId, otherId)).toBe(true);
    });

    it('returns false if same user', () => {
      expect(permissionsService.canAccessPrivateChat(userId, userId)).toBe(false);
    });
  });
});