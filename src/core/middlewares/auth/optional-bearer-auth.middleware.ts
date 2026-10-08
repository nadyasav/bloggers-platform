import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { JwtService } from '../../services/jwt.service';
import { config } from '../../config';

@injectable()
export class OptionalBearerAuthMiddleware {
  private jwtService: JwtService;

  constructor(@inject(JwtService) jwtService: JwtService) {
    this.jwtService = jwtService;
  }

  handle(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const [, token] = authHeader.split(' ');
    const payload = this.jwtService.verifyToken(
      token,
      config.accessTokenSecret,
    );

    if (payload) {
      req.userId = payload.userId;
    }

    next();
  }
}
