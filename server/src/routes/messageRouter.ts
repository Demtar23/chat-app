import { Router } from 'express';
import { messagesController } from '../controllers/message.controller';
import { catchError } from '../utils/catchError';
import { authMiddleware } from '../middlewares/auth.middleware';

export const messageRouter = Router();

messageRouter.get(
  '/',
  authMiddleware,
  catchError(messagesController.getMessages),
);