import { Request, Response, NextFunction } from 'express';
import { jwt } from '../utils/jwt';

export function guestMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization ?? '';
  const [, token] = authHeader.split(' ');

  if (!token) {
    return next();
  }

  const userData = jwt.validateAccessToken(token);

  if (userData) {
    return res.status(403).json({
      message: 'Already authenticated',
    });
  }

  next();
}
