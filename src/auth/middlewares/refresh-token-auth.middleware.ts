import { NextFunction, Request, Response } from 'express';
import { REFRESH_TOKEN_COOKIE } from '../auth.constants';
import { authService } from '../application/auth.service';
import { ResultStatus } from '../../core/types/result.types';

export const refreshTokenAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies[REFRESH_TOKEN_COOKIE];

  if (!token) {
    return res.sendStatus(401);
  }

  const result = await authService.verifyRefreshToken(token);

  if (result.status !== ResultStatus.Success) {
    return res.sendStatus(401);
  }

  req.refreshTokenPayload = result.data;
  next();
};
