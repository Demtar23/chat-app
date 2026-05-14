import { Router, Response, Request } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { User } from '../models/User';

export const userRouter = Router();

userRouter.get('/me', authMiddleware, (req, res: Response) => {
  return res.status(200).json({
    user: req.user,
  });
});

userRouter.get('/all', authMiddleware, async (req: Request, res: Response) => {
  const users = await User.find({}, { passwordHash: 0 });
  return res.status(200).json(users);
});