import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { catchError } from '../utils/catchError';
import { userController } from '../controllers/user.controller';

export const userRouter = Router();

userRouter.get('/me', authMiddleware, catchError(userController.getMe));

userRouter.get('/all', authMiddleware, catchError(userController.getAllUsers));

userRouter.get('/:id', authMiddleware, catchError(userController.getUserById));

userRouter.patch('/me', authMiddleware, catchError(userController.updateMe));