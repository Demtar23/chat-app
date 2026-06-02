import { Router } from 'express';
import { messagesController } from '../controllers/message.controller';
import { catchError } from '../utils/catchError';
import { authMiddleware } from '../middlewares/auth.middleware';

export const messageRouter = Router();

messageRouter.get(
  '/global',
  authMiddleware,
  catchError(messagesController.getGlobalMessagesCursor),
);

messageRouter.get(
  '/room/:roomId',
  authMiddleware,
  catchError(messagesController.getRoomMessagesCursor),
);

messageRouter.get(
  '/private/:userId',
  authMiddleware,
  catchError(messagesController.getPrivateMessagesCursor),
);

messageRouter.get(
  '/pinned',
  authMiddleware,
  catchError(messagesController.getPinnedMessages),
);

messageRouter.get(
  '/search',
  authMiddleware,
  catchError(messagesController.searchMessages),
);

messageRouter.get(
  '/around/:messageId',
  authMiddleware,
  catchError(messagesController.getMessagesAround),
);

messageRouter.post(
  '/:messageId/pin',
  authMiddleware,
  catchError(messagesController.pinMessage),
);

messageRouter.post(
  '/:messageId/unpin',
  authMiddleware,
  catchError(messagesController.unpinMessage),
);

messageRouter.post(
  '/:messageId/react',
  authMiddleware,
  catchError(messagesController.reactToMessage),
);

messageRouter.patch(
  '/:messageId',
  authMiddleware,
  catchError(messagesController.editMessage),
);

messageRouter.delete(
  '/:messageId',
  authMiddleware,
  catchError(messagesController.deleteMessageForAll),
);

messageRouter.delete(
  '/:messageId/me',
  authMiddleware,
  catchError(messagesController.deleteMessageForMe),
);
