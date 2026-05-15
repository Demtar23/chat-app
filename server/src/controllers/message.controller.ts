import { Request, Response } from 'express';
import { messagesService } from '../services/message.service';

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
    return res.status(400).json({ message: 'Emoji is required' });
  }

  const message = await messagesService.toggleReaction(
    messageId,
    emoji,
    userId,
  );

  if (!message) {
    return res.status(404).json({ message: 'Message not found' });
  }

  return res.status(200).json(message);
}

async function editMessage(req: Request, res: Response) {
  const messageId = req.params.messageId as string;
  const { text } = req.body;
  const { id: userId } = req.user!;

  if (!text?.trim()) {
    return res.status(400).json({ message: 'Text is required' });
  }

  const message = await messagesService.editMessage(
    messageId,
    text.trim(),
    userId,
  );

  if (!message) {
    return res
      .status(404)
      .json({ message: 'Message not found or not authorized' });
  }

  return res.status(200).json(message);
}

async function deleteMessageForAll(req: Request, res: Response) {
  const messageId = req.params.messageId as string;
  const { id: userId } = req.user!;

  const message = await messagesService.deleteMessageForAll(messageId, userId);

  if (!message) {
    return res
      .status(404)
      .json({ message: 'Message not found or not authorized' });
  }

  return res.status(200).json(message);
}

async function deleteMessageForMe(req: Request, res: Response) {
  const messageId = req.params.messageId as string;
  const { id: userId } = req.user!;

  const message = await messagesService.deleteMessageForMe(messageId, userId);

  if (!message) {
    return res.status(404).json({ message: 'Message not found' });
  }

  return res.status(200).json(message);
}

export const messagesController = {
  getGlobalMessages,
  getRoomMessages,
  getPrivateMessages,
  reactToMessage,
  editMessage,
  deleteMessageForAll,
  deleteMessageForMe,
};
