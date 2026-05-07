import { Router, Response } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';

export const userRouter = Router();

userRouter.get('/me', authMiddleware, (req, res: Response) => {
  return res.status(200).json({
    user: req.user,
  });
});
