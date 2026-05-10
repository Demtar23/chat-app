import { Request, Response } from 'express';
import { messagesService } from '../services/message.service';

async function getMessages(req: Request, res: Response) {
  const messages = await messagesService.getAllMessages();

  return res.status(200).json(messages);
}

export const messagesController = {
  getMessages,
};