import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

export function errorMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // кастомна помилка
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      code: error.code,
    });
  }

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: error.message,
      code: 'VALIDATION_ERROR',
    });
  }

  // Mongoose duplicate key
  if ((error as NodeJS.ErrnoException).code === '11000') {
    return res.status(409).json({
      message: 'Already exists',
      code: 'CONFLICT',
    });
  }

  // JWT помилки
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Invalid token',
      code: 'UNAUTHORIZED',
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Token expired',
      code: 'TOKEN_EXPIRED',
    });
  }

  // невідома помилка
  console.error('[Server Error]', error);

  return res.status(500).json({
    message: 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
}
