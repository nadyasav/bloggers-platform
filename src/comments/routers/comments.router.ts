import { Router } from 'express';
import { idParamValidation } from '../../core/validation/id-param.validation';
import { validationResultMiddleware } from '../../core/middlewares/validation-result.middleware';
import { commentValidation } from '../validation/comment.validation';
import { container } from '../../composition-root';
import { BearerAuthMiddleware } from '../../core/middlewares/auth/bearer-auth.middleware';
import { CommentsController } from './comments.controller';
import { likeValidation } from '../../likes/validation/like.validation';
import { OptionalBearerAuthMiddleware } from '../../core/middlewares/auth/optional-bearer-auth.middleware';

const bearerAuthMiddleware = container.get(BearerAuthMiddleware);
const optionalBearerAuthMiddleware = container.get(
  OptionalBearerAuthMiddleware,
);
const commentsController = container.get(CommentsController);

export const commentsRouter = Router();

commentsRouter
  .get(
    '/:id',
    optionalBearerAuthMiddleware.handle.bind(optionalBearerAuthMiddleware),
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
  .put(
    '/:id/like-status',
    bearerAuthMiddleware.handle.bind(bearerAuthMiddleware),
    idParamValidation,
    likeValidation,
    validationResultMiddleware,
    commentsController.updateLikeStatusHandler.bind(commentsController),
  )
  .delete(
    '/:id',
    bearerAuthMiddleware.handle.bind(bearerAuthMiddleware),
    idParamValidation,
    validationResultMiddleware,
    commentsController.deleteCommentHandler.bind(commentsController),
  );
