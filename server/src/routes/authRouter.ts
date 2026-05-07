import { Router } from 'express';
import { catchError } from '../utils/catchError';
import { authController } from '../controllers/auth.controller';
import { validateBody } from '../middlewares/validateBody';
import { loginSchema, registerSchema } from '../validations/auth.schema';

export const authRouter = Router();

authRouter.post(
  '/register',
  validateBody(registerSchema),
  catchError(authController.register),
);

authRouter.post(
  '/login',
  validateBody(loginSchema),
  catchError(authController.login),
);
