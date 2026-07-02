import { Router } from 'express';
import { basicAuthMiddleware } from '../../core/middlewares/auth/basic-auth.middleware';
import { userValidation } from '../validation/user.validation';
import { validationResultMiddleware } from '../../core/middlewares/validation-result.middleware';
import { createUserHandler } from './handlers/create-user.handler';
import { idParamValidation } from '../../core/validation/id-param.validation';
import { deleteUserHandler } from './handlers/delete-user.handler';
import { userQueryValidation } from '../validation/user-query.validation';
import { getUsersHandler } from './handlers/get-users.handler';

export const usersRouter = Router();

usersRouter
  .get(
    '',
    basicAuthMiddleware,
    userQueryValidation,
    validationResultMiddleware,
    getUsersHandler,
  )

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
