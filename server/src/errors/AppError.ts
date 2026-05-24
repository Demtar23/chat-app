export type ErrorCode =
  | 'INTERNAL_ERROR'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'TOKEN_EXPIRED';

const STATUS_MAP: Record<ErrorCode, number> = {
  INTERNAL_ERROR: 500,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  CONFLICT: 409,
  TOKEN_EXPIRED: 401,
};

export class AppError extends Error {
  public statusCode: number;

  constructor(
    public message: string,
    public code: ErrorCode = 'INTERNAL_ERROR',
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = STATUS_MAP[code];
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super(message, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 'CONFLICT');
    this.name = 'ConflictError';
  }
}
