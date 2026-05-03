import { NextFunction, Request, Response } from 'express';

const ADMIN_LOGIN = process.env.ADMIN_LOGIN || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'qwerty';

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

  if (login !== ADMIN_LOGIN || password !== ADMIN_PASSWORD) {
    return res.status(401).send({ message: 'Invalid credentials' });
  }

  next();
};
