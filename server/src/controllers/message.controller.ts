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

export const messagesController = {
  getGlobalMessages,
  getRoomMessages,
  getPrivateMessages,
};
