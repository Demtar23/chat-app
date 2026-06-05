import { Router } from 'express';
import { catchError } from '../utils/catchError';
import { authController } from '../controllers/auth.controller';
import { validateBody } from '../middlewares/validateBody';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  setupProfileSchema,
} from '../validations/auth.schema';
import { guestMiddleware } from '../middlewares/guestMiddleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import passport from '../config/passport';

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

authRouter.get('/verify-email/:token', catchError(authController.verifyEmail));

authRouter.post(
  '/change-password',
  authMiddleware,
  validateBody(changePasswordSchema),
  catchError(authController.changePassword),
);

authRouter.post(
  '/setup-profile',
  validateBody(setupProfileSchema),
  catchError(authController.setupProfile),
);

authRouter.post('/refresh', catchError(authController.refresh));

authRouter.post('/logout', catchError(authController.logout));

authRouter.post(
  '/forgot-password',
  validateBody(forgotPasswordSchema),
  catchError(authController.forgotPassword),
);
authRouter.post(
  '/reset-password/:token',
  validateBody(resetPasswordSchema),
  catchError(authController.resetPassword),
);

authRouter.get(
  '/google',
  passport.authenticate('google', {
    scope: ['email', 'profile'],
    session: false,
    prompt: 'select_account',
  }),
);

authRouter.get(
  '/google/register',
  passport.authenticate('google-register', {
    scope: ['email', 'profile'],
    session: false,
    prompt: 'select_account',
  }),
);

authRouter.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed`,
  }),
  catchError(authController.googleCallback),
);

authRouter.get(
  '/google/register/callback',
  passport.authenticate('google-register', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/register?error=google_failed`,
  }),
  catchError(authController.googleRegisterCallback),
);
