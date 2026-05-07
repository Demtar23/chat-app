import { Request, Response, NextFunction } from 'express';
import { jwt } from '../utils/jwt';

type AuthRequest = Request & {
  user?: {
    id: string;
    username: string;
  };
};

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization || '';

  if (!authHeader) {
    return res.status(401).json({
      message: 'No token provided',
    });
  }

  const [, accessToken] = authHeader.split(' ');

  const user = jwt.validateAccessToken(accessToken);

  if (!user) {
    return res.status(401).json({
      message: 'Invalid token',
    });
  }

  req.user = user;

  next();
}
