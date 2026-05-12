import { Router } from 'express';
import { messagesController } from '../controllers/message.controller';
import { catchError } from '../utils/catchError';
import { authMiddleware } from '../middlewares/auth.middleware';

export const messageRouter = Router();

messageRouter.get(
  '/global',
  authMiddleware,
  catchError(messagesController.getGlobalMessages),
);

messageRouter.get(
  '/room/:roomId',
  authMiddleware,
  catchError(messagesController.getRoomMessages),
);

messageRouter.get(
  '/private/:userId',
  authMiddleware,
  catchError(messagesController.getPrivateMessages),
);
