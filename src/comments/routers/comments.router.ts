import { Router } from 'express';
import { idParamValidation } from '../../core/validation/id-param.validation';
import { validationResultMiddleware } from '../../core/middlewares/validation-result.middleware';
import { getCommentHandler } from './handlers/get-comment.handler';
import { deleteCommentHandler } from './handlers/delete-comment.handler';
import { commentValidation } from '../validation/comment.validation';
import { updateCommentHandler } from './handlers/update-comment.handler';
import { bearerAuthMiddleware } from '../../composition-root';

export const commentsRouter = Router();

commentsRouter
  .get('/:id', idParamValidation, validationResultMiddleware, getCommentHandler)
  .put(
    '/:id',
    bearerAuthMiddleware.handle.bind(bearerAuthMiddleware),
    idParamValidation,
    commentValidation,
    validationResultMiddleware,
    updateCommentHandler,
  )
  .delete(
    '/:id',
    bearerAuthMiddleware.handle.bind(bearerAuthMiddleware),
    idParamValidation,
    validationResultMiddleware,
    deleteCommentHandler,
  );
