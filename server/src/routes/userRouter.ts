import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { catchError } from '../utils/catchError';
import { userController } from '../controllers/user.controller';
import { upload } from '../middlewares/upload';

export const userRouter = Router();

userRouter.get('/me', authMiddleware, catchError(userController.getMe));

userRouter.get('/all', authMiddleware, catchError(userController.getAllUsers));

userRouter.get('/:id', authMiddleware, catchError(userController.getUserById));

userRouter.patch('/me', authMiddleware, catchError(userController.updateMe));

userRouter.post(
  '/me/avatar',
  authMiddleware,
  upload.single('avatar'),
  catchError(userController.uploadAvatarHandler),
);

userRouter.delete(
  '/me/avatar',
  authMiddleware,
  catchError(userController.deleteAvatarHandler),
);
