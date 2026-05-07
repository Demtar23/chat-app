import { Request, Response, NextFunction } from 'express';

type Action = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

export function catchError(action: Action) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      await action(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}
