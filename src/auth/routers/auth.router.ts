import { Router } from 'express';
import { loginValidation } from '../validation/login.validation';
import { validationResultMiddleware } from '../../core/middlewares/validation-result.middleware';
import { loginHandler } from './handlers/login.handler';
import { meHandler } from './handlers/me.handler';
import { bearerAuthMiddleware } from '../../core/middlewares/auth/bearer-auth.middleware';
import { registrationValidation } from '../validation/registration.validation';
import { registrationHandler } from './handlers/registration.handler';
import { registrationConfirmationHandler } from './handlers/registration-confirmation.handler';
import { registrationConfirmationValidation } from '../validation/registration-confirmation.validation';
import { emailResendingValidation } from '../validation/email-resending.validation';
import { emailResendingHandler } from './handlers/email-resending.handler';
import { refreshTokenHandler } from './handlers/refresh-token.handler';
import { logoutHandler } from './handlers/logout.handler';
import { refreshTokenAuthMiddleware } from '../middlewares/refresh-token-auth.middleware';

export const authRouter = Router();

authRouter
  .post('/login', loginValidation, validationResultMiddleware, loginHandler)
  .post(
    '/registration',
    registrationValidation,
    validationResultMiddleware,
    registrationHandler,
  )
  .post(
    '/registration-confirmation',
    registrationConfirmationValidation,
    validationResultMiddleware,
    registrationConfirmationHandler,
  )
  .post(
    '/registration-email-resending',
    emailResendingValidation,
    validationResultMiddleware,
    emailResendingHandler,
  )
  .post('/refresh-token', refreshTokenAuthMiddleware, refreshTokenHandler)
  .post('/logout', refreshTokenAuthMiddleware, logoutHandler)
  .get('/me', bearerAuthMiddleware, meHandler);
