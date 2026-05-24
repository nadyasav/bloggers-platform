import { Router } from 'express';
import { loginValidation } from '../validation/login.validation';
import { validationResultMiddleware } from '../../core/middlewares/validation-result.middleware';
import { loginHandler } from './handlers/login.handler';

export const authRouter = Router();

authRouter.post(
  '/login',
  loginValidation,
  validationResultMiddleware,
  loginHandler,
);
