import { Request, Response, NextFunction } from 'express';

export function errorMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.error(error);

  return res.status(500).json({
    message: 'Server error',
  });
}
