import { Router } from 'express';
import { loginValidation } from '../validation/login.validation';
import { validationResultMiddleware } from '../../core/middlewares/validation-result.middleware';
import { loginHandler } from './handlers/login.handler';
import { meHandler } from './handlers/me.handler';
import { bearerAuthMiddleware } from '../../core/middlewares/auth/bearer-auth.middleware';

export const authRouter = Router();

authRouter
  .post('/login', loginValidation, validationResultMiddleware, loginHandler)
  .get('/me', bearerAuthMiddleware, meHandler);
