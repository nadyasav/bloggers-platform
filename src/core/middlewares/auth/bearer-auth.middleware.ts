import { NextFunction, Request, Response } from 'express';
import { jwtService } from '../../services/jwt.service';
import { config } from '../../config';

export const bearerAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send({ message: 'Unauthorized' });
  }

  const [, token] = authHeader.split(' ');
  const payload = jwtService.verifyToken(token, config.accessTokenSecret);

  if (!payload) {
    return res.status(401).send({ message: 'Unauthorized' });
  }

  req.userId = payload.userId;
  next();
};
