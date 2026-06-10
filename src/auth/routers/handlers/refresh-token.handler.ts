import { Request, Response } from 'express';
import { authService } from '../../application/auth.service';
import { ResultStatus } from '../../../core/types/result.types';
import { REFRESH_TOKEN_COOKIE } from '../../auth.constants';

export async function refreshTokenHandler(req: Request, res: Response) {
  const result = await authService.refreshToken(req.refreshToken!);

  if (result.status !== ResultStatus.Success) {
    throw new Error();
  }

  res.cookie(REFRESH_TOKEN_COOKIE, result.data.refreshToken, {
    httpOnly: true,
    secure: true,
  });
  res.status(200).send({ accessToken: result.data.accessToken });
}
