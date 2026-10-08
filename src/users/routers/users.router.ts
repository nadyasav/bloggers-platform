import { Router } from 'express';
import { basicAuthMiddleware } from '../../core/middlewares/auth/basic-auth.middleware';
import { userValidation } from '../validation/user.validation';
import { validationResultMiddleware } from '../../core/middlewares/validation-result.middleware';
import { idParamValidation } from '../../core/validation/id-param.validation';
import { userQueryValidation } from '../validation/user-query.validation';
import { container } from '../../composition-root';
import { UsersController } from './users.controller';

const usersController = container.get(UsersController);

export const usersRouter = Router();

usersRouter
  .get(
    '',
    basicAuthMiddleware,
    userQueryValidation,
    validationResultMiddleware,
    usersController.getUsersHandler.bind(usersController),
  )

  .post(
    '',
    basicAuthMiddleware,
    userValidation,
    validationResultMiddleware,
    usersController.createUserHandler.bind(usersController),
  )

  .delete(
    '/:id',
    basicAuthMiddleware,
    idParamValidation,
    validationResultMiddleware,
    usersController.deleteUserHandler.bind(usersController),
  );
