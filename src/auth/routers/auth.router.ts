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
import { rateLimit } from '../../core/middlewares/rate-limit.middleware';
import { RATE_LIMIT } from '../auth.constants';

export const authRouter = Router();

authRouter
  .post(
    '/login',
    rateLimit(RATE_LIMIT.LIMIT, RATE_LIMIT.WINDOW_SECONDS),
    loginValidation,
    validationResultMiddleware,
    loginHandler,
  )
  .post(
    '/registration',
    rateLimit(RATE_LIMIT.LIMIT, RATE_LIMIT.WINDOW_SECONDS),
    registrationValidation,
    validationResultMiddleware,
    registrationHandler,
  )
  .post(
    '/registration-confirmation',
    rateLimit(RATE_LIMIT.LIMIT, RATE_LIMIT.WINDOW_SECONDS),
    registrationConfirmationValidation,
    validationResultMiddleware,
    registrationConfirmationHandler,
  )
  .post(
    '/registration-email-resending',
    rateLimit(RATE_LIMIT.LIMIT, RATE_LIMIT.WINDOW_SECONDS),
    emailResendingValidation,
    validationResultMiddleware,
    emailResendingHandler,
  )
  .post('/refresh-token', refreshTokenAuthMiddleware, refreshTokenHandler)
  .post('/logout', refreshTokenAuthMiddleware, logoutHandler)
  .get('/me', bearerAuthMiddleware, meHandler);
