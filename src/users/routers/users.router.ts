import { Router } from 'express';
import { basicAuthMiddleware } from '../../core/middlewares/auth/basic-auth.middleware';
import { userValidation } from '../validation/user.validation';
import { validationResultMiddleware } from '../../core/middlewares/validation-result.middleware';
import { createUserHandler } from './handlers/create-user.handler';
import { idParamValidation } from '../../core/validation/id-param.validation';
import { deleteUserHandler } from './handlers/delete-user.handler';

export const usersRouter = Router();

usersRouter
  .post(
    '',
    basicAuthMiddleware,
    userValidation,
    validationResultMiddleware,
    createUserHandler,
  )

  .delete(
    '/:id',
    basicAuthMiddleware,
    idParamValidation,
    validationResultMiddleware,
    deleteUserHandler,
  );
