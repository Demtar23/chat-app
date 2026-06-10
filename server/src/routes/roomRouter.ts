import { Router } from 'express';
import { roomsController } from '../controllers/room.controller';
import { catchError } from '../utils/catchError';
import { authMiddleware } from '../middlewares/auth.middleware';

export const roomRouter = Router();

roomRouter.post('/', authMiddleware, catchError(roomsController.createRoom));

roomRouter.get('/', authMiddleware, catchError(roomsController.getAllRooms));

roomRouter.get(
  '/:roomId',
  authMiddleware,
  catchError(roomsController.getRoomById),
);

roomRouter.post(
  '/:roomId/join',
  authMiddleware,
  catchError(roomsController.joinRoom),
);

roomRouter.post(
  '/:roomId/leave',
  authMiddleware,
  catchError(roomsController.leaveRoom),
);

roomRouter.delete(
  '/:roomId',
  authMiddleware,
  catchError(roomsController.deleteRoom),
);

roomRouter.patch(
  '/:roomId',
  authMiddleware,
  catchError(roomsController.updateRoom),
);
