import { NODE_ENV } from '@/config/env';
import { HTTP_STATUS } from '@/constants/http-status';
import { HttpError } from '@/utils/http-error';
import { NextFunction, Request, Response } from 'express';

export const handleRouteError = (
  err: HttpError,
  _: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) => {
  res.status(err.httpStatus || HTTP_STATUS.INTERNAL_SERVER).json({
    message: err.message || 'Internal server error',
    validationErrors: err.validationErrors || undefined,
    stack:
      NODE_ENV !== 'production'
        ? err.stack?.split('\n').map((line) => line.trim())
        : undefined,
  });
};
