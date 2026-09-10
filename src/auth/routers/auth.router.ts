import { Router } from 'express';
import { loginValidation } from '../validation/login.validation';
import { validationResultMiddleware } from '../../core/middlewares/validation-result.middleware';
import { registrationValidation } from '../validation/registration.validation';
import { registrationConfirmationValidation } from '../validation/registration-confirmation.validation';
import { emailResendingValidation } from '../validation/email-resending.validation';
import { AUTH_BASE_PATH, AUTH_PATHS, RATE_LIMIT } from '../auth.constants';
import { passwordRecoveryValidation } from '../validation/password-recovery.validation';
import { newPasswordValidation } from '../validation/new-password.validation';
import { container } from '../../composition-root';
import { AuthController } from './auth.controller';
import { BearerAuthMiddleware } from '../../core/middlewares/auth/bearer-auth.middleware';
import { RateLimit } from '../../core/middlewares/rate-limit.middleware';
import { RefreshTokenAuthMiddleware } from '../middlewares/refresh-token-auth.middleware';

const authController = container.get(AuthController);
const bearerAuthMiddleware = container.get(BearerAuthMiddleware);
const rateLimit = container.get(RateLimit);
const refreshTokenAuthMiddleware = container.get(RefreshTokenAuthMiddleware);

export const authRouter = Router();

authRouter
  .post(
    AUTH_PATHS.LOGIN,
    rateLimit.create(
      AUTH_BASE_PATH + AUTH_PATHS.LOGIN,
      RATE_LIMIT.LIMIT,
      RATE_LIMIT.WINDOW_SECONDS,
    ),
    loginValidation,
    validationResultMiddleware,
    authController.loginHandler.bind(authController),
  )
  .post(
    AUTH_PATHS.PASSWORD_RECOVERY,
    rateLimit.create(
      AUTH_BASE_PATH + AUTH_PATHS.PASSWORD_RECOVERY,
      RATE_LIMIT.LIMIT,
      RATE_LIMIT.WINDOW_SECONDS,
    ),
    passwordRecoveryValidation,
    validationResultMiddleware,
    authController.passwordRecoveryHandler.bind(authController),
  )
  .post(
    AUTH_PATHS.NEW_PASSWORD,
    rateLimit.create(
      AUTH_BASE_PATH + AUTH_PATHS.NEW_PASSWORD,
      RATE_LIMIT.LIMIT,
      RATE_LIMIT.WINDOW_SECONDS,
    ),
    newPasswordValidation,
    validationResultMiddleware,
    authController.newPasswordHandler.bind(authController),
  )
  .post(
    AUTH_PATHS.REGISTRATION,
    rateLimit.create(
      AUTH_BASE_PATH + AUTH_PATHS.REGISTRATION,
      RATE_LIMIT.LIMIT,
      RATE_LIMIT.WINDOW_SECONDS,
    ),
    registrationValidation,
    validationResultMiddleware,
    authController.registrationHandler.bind(authController),
  )
  .post(
    AUTH_PATHS.REGISTRATION_CONFIRMATION,
    rateLimit.create(
      AUTH_BASE_PATH + AUTH_PATHS.REGISTRATION_CONFIRMATION,
      RATE_LIMIT.LIMIT,
      RATE_LIMIT.WINDOW_SECONDS,
    ),
    registrationConfirmationValidation,
    validationResultMiddleware,
    authController.registrationConfirmationHandler.bind(authController),
  )
  .post(
    AUTH_PATHS.REGISTRATION_EMAIL_RESENDING,
    rateLimit.create(
      AUTH_BASE_PATH + AUTH_PATHS.REGISTRATION_EMAIL_RESENDING,
      RATE_LIMIT.LIMIT,
      RATE_LIMIT.WINDOW_SECONDS,
    ),
    emailResendingValidation,
    validationResultMiddleware,
    authController.emailResendingHandler.bind(authController),
  )
  .post(
    '/refresh-token',
    refreshTokenAuthMiddleware.handle.bind(refreshTokenAuthMiddleware),
    authController.refreshTokenHandler.bind(authController),
  )
  .post(
    '/logout',
    refreshTokenAuthMiddleware.handle.bind(refreshTokenAuthMiddleware),
    authController.logoutHandler.bind(authController),
  )
  .get(
    '/me',
    bearerAuthMiddleware.handle.bind(bearerAuthMiddleware),
    authController.meHandler.bind(authController),
  );
