import { Request, Response } from 'express';
import { messagesService } from '../services/message.service';
import { NotFoundError, ValidationError } from '../errors/AppError';

async function getGlobalMessages(req: Request, res: Response) {
  const page = Number(req.query.page) || 1;

  const messages = await messagesService.getGlobalMessages(page);

  return res.status(200).json(messages);
}

async function getRoomMessages(req: Request, res: Response) {
  const roomId = req.params.roomId as string;
  const page = Number(req.query.page) || 1;

  const messages = await messagesService.getRoomMessages(roomId, page);

  return res.status(200).json(messages);
}

async function getPrivateMessages(req: Request, res: Response) {
  const userId = req.params.userId as string;
  const { id: currentUserId } = req.user!;
  const page = Number(req.query.page as string) || 1;
  const messages = await messagesService.getPrivateMessages(
    currentUserId,
    userId,
    page,
  );
  return res.status(200).json(messages);
}

async function reactToMessage(req: Request, res: Response) {
  const messageId = req.params.messageId as string;
  const { emoji } = req.body;
  const { id: userId } = req.user!;

  if (!emoji) {
    throw new ValidationError('Emoji is required');
  }

  const message = await messagesService.toggleReaction(
    messageId,
    emoji,
    userId,
  );

  if (!message) {
    throw new NotFoundError('Message not found');
  }

  return res.status(200).json(message);
}

async function editMessage(req: Request, res: Response) {
  const messageId = req.params.messageId as string;
  const { text } = req.body;
  const { id: userId } = req.user!;

  if (!text?.trim()) {
    throw new ValidationError('Text is required');
  }

  const message = await messagesService.editMessage(
    messageId,
    text.trim(),
    userId,
  );

  if (!message) {
    throw new NotFoundError('Message not found or not authorized');
  }

  return res.status(200).json(message);
}

async function deleteMessageForAll(req: Request, res: Response) {
  const messageId = req.params.messageId as string;
  const { id: userId } = req.user!;

  const message = await messagesService.deleteMessageForAll(messageId, userId);

  if (!message) {
    throw new NotFoundError('Message not found or not authorized');
  }

  return res.status(200).json(message);
}

async function deleteMessageForMe(req: Request, res: Response) {
  const messageId = req.params.messageId as string;
  const { id: userId } = req.user!;

  const message = await messagesService.deleteMessageForMe(messageId, userId);

  if (!message) {
    throw new NotFoundError('Message not found');
  }

  return res.status(200).json(message);
}
async function pinMessage(req: Request, res: Response) {
  const messageId = req.params.messageId as string;

  const message = await messagesService.pinMessage(messageId);

  if (!message) {
    throw new NotFoundError('Message not found');
  }

  return res.status(200).json(message);
}

async function unpinMessage(req: Request, res: Response) {
  const messageId = req.params.messageId as string;

  const message = await messagesService.unpinMessage(messageId);

  if (!message) {
    throw new NotFoundError('Message not found');
  }

  return res.status(200).json(message);
}

async function getPinnedMessages(req: Request, res: Response) {
  const { type, roomId, userId } = req.query;
  const { id: currentUserId } = req.user!;

  const messages = await messagesService.getPinnedMessages({
    type: type as 'global' | 'room' | 'private',
    roomId: roomId as string | undefined,
    senderId: currentUserId,
    receiverId: userId as string | undefined,
  });

  return res.status(200).json(messages);
}

export const messagesController = {
  getGlobalMessages,
  getRoomMessages,
  getPrivateMessages,
  reactToMessage,
  editMessage,
  deleteMessageForAll,
  deleteMessageForMe,
  pinMessage,
  unpinMessage,
  getPinnedMessages,
};
