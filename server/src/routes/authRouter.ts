import { Router } from 'express';
import { catchError } from '../utils/catchError';
import { authController } from '../controllers/auth.controller';
import { validateBody } from '../middlewares/validateBody';
import { loginSchema, registerSchema } from '../validations/auth.schema';
import { guestMiddleware } from '../middlewares/guestMiddleware';
import { authMiddleware } from '../middlewares/auth.middleware';

export const authRouter = Router();

authRouter.post(
  '/register',
  guestMiddleware,
  validateBody(registerSchema),
  catchError(authController.register),
);

authRouter.post(
  '/login',
  guestMiddleware,
  validateBody(loginSchema),
  catchError(authController.login),
);

authRouter.post('/refresh', catchError(authController.refresh));

authRouter.post('/logout', catchError(authController.logout));
