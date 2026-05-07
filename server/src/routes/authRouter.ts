import { Router } from 'express';
import { catchError } from '../utils/catchError';
import { authController } from '../controllers/auth.controller';

export const authRouter = Router();

authRouter.post('/register', catchError(authController.register));