import mongoose from 'mongoose';
import { Message } from '../models/Message';
import { messagesService } from '../services/message.service';
import './setup';

describe('messagesService', () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const otherId = new mongoose.Types.ObjectId().toString();

  describe('deleteMessageForMe', () => {
    it('adds userId to deletedFor array', async () => {
      const message = await Message.create({
        text: 'hello',
        senderId: otherId,
        senderUsername: 'other',
        type: 'global',
      });
      await messagesService.deleteMessageForMe(message._id.toString(), userId);
      const updated = await Message.findById(message._id);
      expect(updated?.deletedFor).toContain(userId);
    });

    it('excludes message from global feed for that user', async () => {
      await Message.create({
        text: 'hidden message',
        senderId: otherId,
        senderUsername: 'other',
        type: 'global',
        deletedFor: [userId],
      });
      const messages = await messagesService.getGlobalMessagesBefore(
        undefined,
        30,
        userId,
      );
      const texts = messages.map((m) => m.text);
      expect(texts).not.toContain('hidden message');
    });

    it('still shows message to other users', async () => {
      await Message.create({
        text: 'visible to others',
        senderId: otherId,
        senderUsername: 'other',
        type: 'global',
        deletedFor: [userId],
      });
      const messages = await messagesService.getGlobalMessagesBefore(
        undefined,
        30,
        otherId,
      );
      const texts = messages.map((m) => m.text);
      expect(texts).toContain('visible to others');
    });
  });

  describe('deleteMessageForAll', () => {
    it('marks message as deleted', async () => {
      const message = await Message.create({
        text: 'delete me',
        senderId: userId,
        senderUsername: 'testuser',
        type: 'global',
      });
      await messagesService.deleteMessageForAll(message._id.toString(), userId);
      const updated = await Message.findById(message._id);
      expect(updated?.isDeleted).toBe(true);
    });

    it('returns null when user is not the owner', async () => {
      const message = await Message.create({
        text: 'not mine',
        senderId: otherId,
        senderUsername: 'other',
        type: 'global',
      });
      const result = await messagesService.deleteMessageForAll(
        message._id.toString(),
        userId,
      );
      expect(result).toBeNull();
    });
  });

  describe('searchMessages - deletedFor filter', () => {
    it('excludes deleted-for-me messages from search results', async () => {
      await Message.create({
        text: 'secret message',
        senderId: otherId,
        senderUsername: 'other',
        type: 'global',
        deletedFor: [userId],
      });
      const results = await messagesService.searchMessages(
        { type: 'global', query: 'secret' },
        userId,
      );
      const texts = results.map((m) => m.text);
      expect(texts).not.toContain('secret message');
    });

    it('shows search results to other users', async () => {
      await Message.create({
        text: 'findable message',
        senderId: otherId,
        senderUsername: 'other',
        type: 'global',
        deletedFor: [userId],
      });
      const results = await messagesService.searchMessages(
        { type: 'global', query: 'findable' },
        otherId,
      );
      const texts = results.map((m) => m.text);
      expect(texts).toContain('findable message');
    });
  });
});
