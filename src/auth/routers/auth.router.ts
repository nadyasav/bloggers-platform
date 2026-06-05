import { Router } from 'express';
import { loginValidation } from '../validation/login.validation';
import { validationResultMiddleware } from '../../core/middlewares/validation-result.middleware';
import { loginHandler } from './handlers/login.handler';
import { meHandler } from './handlers/me.handler';
import { bearerAuthMiddleware } from '../../core/middlewares/auth/bearer-auth.middleware';
import { registrationValidation } from '../validation/registration.validation';
import { registrationHandler } from './handlers/registration.handler';

export const authRouter = Router();

authRouter
  .post('/login', loginValidation, validationResultMiddleware, loginHandler)
  .post(
    '/registration',
    registrationValidation,
    validationResultMiddleware,
    registrationHandler,
  )
  .get('/me', bearerAuthMiddleware, meHandler);
