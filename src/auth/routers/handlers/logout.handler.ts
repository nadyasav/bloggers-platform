import { Request, Response } from 'express';
import { authService } from '../../application/auth.service';
import { REFRESH_TOKEN_COOKIE } from '../../auth.constants';

export async function logoutHandler(req: Request, res: Response) {
  await authService.logout(req.refreshToken!);

  res.clearCookie(REFRESH_TOKEN_COOKIE);
  res.sendStatus(204);
}
