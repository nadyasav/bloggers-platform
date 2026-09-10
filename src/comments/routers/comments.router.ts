import { Router } from 'express';
import { idParamValidation } from '../../core/validation/id-param.validation';
import { validationResultMiddleware } from '../../core/middlewares/validation-result.middleware';
import { commentValidation } from '../validation/comment.validation';
import { container } from '../../composition-root';
import { BearerAuthMiddleware } from '../../core/middlewares/auth/bearer-auth.middleware';
import { CommentsController } from './comments.controller';

const bearerAuthMiddleware = container.get(BearerAuthMiddleware);
const commentsController = container.get(CommentsController);

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
