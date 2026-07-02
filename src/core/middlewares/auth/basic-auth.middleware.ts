import { NextFunction, Request, Response } from 'express';
import { config } from '../../config';

export const basicAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).send({ message: 'Unauthorized' });
  }

  const [, credentialsBase64] = authHeader.split(' ');
  const credentials = Buffer.from(credentialsBase64, 'base64').toString(
    'utf-8',
  );
  const [login, password] = credentials.split(':');

  if (login !== config.adminLogin || password !== config.adminPassword) {
    return res.status(401).send({ message: 'Invalid credentials' });
  }

  next();
};
