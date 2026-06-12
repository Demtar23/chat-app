import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import multer from 'multer';

export function errorMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      code: error.code,
    });
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: error.message,
      code: 'VALIDATION_ERROR',
    });
  }

  if ((error as NodeJS.ErrnoException).code === '11000') {
    return res.status(409).json({
      message: 'Already exists',
      code: 'CONFLICT',
    });
  }

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

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File is too large. Maximum size is 5 MB',
        code: 'FILE_TOO_LARGE',
      });
    }

    return res.status(400).json({
      message: error.message,
      code: 'VALIDATION_ERROR',
    });
  }

  console.error('[Server Error]', error);

  return res.status(500).json({
    message: 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
}
