import { Router } from 'express';
import { idParamValidation } from '../../core/validation/id-param.validation';
import { validationResultMiddleware } from '../../core/middlewares/validation-result.middleware';
import { commentValidation } from '../validation/comment.validation';
import {
  bearerAuthMiddleware,
  commentsController,
} from '../../composition-root';

export const commentsRouter = Router();

commentsRouter
  .get(
    '/:id',
    idParamValidation,
    validationResultMiddleware,
    commentsController.getCommentHandler.bind(commentsController),
  )
  .put(
    '/:id',
    bearerAuthMiddleware.handle.bind(bearerAuthMiddleware),
    idParamValidation,
    commentValidation,
    validationResultMiddleware,
    commentsController.updateCommentHandler.bind(commentsController),
  )
  .delete(
    '/:id',
    bearerAuthMiddleware.handle.bind(bearerAuthMiddleware),
    idParamValidation,
    validationResultMiddleware,
    commentsController.deleteCommentHandler.bind(commentsController),
  );
