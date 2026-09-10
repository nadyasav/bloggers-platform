import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { REFRESH_TOKEN_COOKIE } from '../auth.constants';
import { AuthService } from '../application/auth.service';
import { ResultStatus } from '../../core/types/result.types';

@injectable()
export class RefreshTokenAuthMiddleware {
  private authService: AuthService;

  constructor(@inject(AuthService) authService: AuthService) {
    this.authService = authService;
  }

  async handle(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies[REFRESH_TOKEN_COOKIE];

    if (!token) {
      return res.sendStatus(401);
    }

    const result = await this.authService.verifyRefreshToken(token);

    if (result.status !== ResultStatus.Success) {
      return res.sendStatus(401);
    }

    req.refreshTokenPayload = result.data;
    next();
  }
}
