import { Router } from 'express';
import { loginValidation } from '../validation/login.validation';
import { validationResultMiddleware } from '../../core/middlewares/validation-result.middleware';
import { bearerAuthMiddleware } from '../../core/middlewares/auth/bearer-auth.middleware';
import { registrationValidation } from '../validation/registration.validation';
import { registrationConfirmationValidation } from '../validation/registration-confirmation.validation';
import { emailResendingValidation } from '../validation/email-resending.validation';
import { refreshTokenAuthMiddleware } from '../middlewares/refresh-token-auth.middleware';
import { rateLimit } from '../../core/middlewares/rate-limit.middleware';
import { AUTH_BASE_PATH, AUTH_PATHS, RATE_LIMIT } from '../auth.constants';
import { passwordRecoveryValidation } from '../validation/password-recovery.validation';
import { newPasswordValidation } from '../validation/new-password.validation';
import { authController } from '../../composition-root';

export const authRouter = Router();

authRouter
  .post(
    AUTH_PATHS.LOGIN,
    rateLimit(
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
    rateLimit(
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
    rateLimit(
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
    rateLimit(
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
    rateLimit(
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
    rateLimit(
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
    refreshTokenAuthMiddleware,
    authController.refreshTokenHandler.bind(authController),
  )
  .post(
    '/logout',
    refreshTokenAuthMiddleware,
    authController.logoutHandler.bind(authController),
  )
  .get(
    '/me',
    bearerAuthMiddleware,
    authController.meHandler.bind(authController),
  );
