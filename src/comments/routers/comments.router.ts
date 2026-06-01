import { Router } from 'express';
import { idParamValidation } from '../../core/validation/id-param.validation';
import { validationResultMiddleware } from '../../core/middlewares/validation-result.middleware';
import { getCommentHandler } from './handlers/get-comment.handler';
import { bearerAuthMiddleware } from '../../core/middlewares/auth/bearer-auth.middleware';
import { deleteCommentHandler } from './handlers/delete-comment.handler';

export const commentsRouter = Router();

commentsRouter
  .get('/:id', idParamValidation, validationResultMiddleware, getCommentHandler)
  .delete(
    '/:id',
    bearerAuthMiddleware,
    idParamValidation,
    validationResultMiddleware,
    deleteCommentHandler,
  );
