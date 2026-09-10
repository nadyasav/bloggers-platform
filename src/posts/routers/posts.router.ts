import { Router } from 'express';
import { basicAuthMiddleware } from '../../core/middlewares/auth/basic-auth.middleware';
import { postValidation } from '../validation/post.validation';
import { validationResultMiddleware } from '../../core/middlewares/validation-result.middleware';
import { idParamValidation } from '../../core/validation/id-param.validation';
import { postQueryValidation } from '../validation/post-query.validation';
import { commentValidation } from '../../comments/validation/comment.validation';
import { commentQueryValidation } from '../../comments/validation/comment-query.validation';
import { container } from '../../composition-root';
import { BearerAuthMiddleware } from '../../core/middlewares/auth/bearer-auth.middleware';
import { PostsController } from './posts.controller';

const bearerAuthMiddleware = container.get(BearerAuthMiddleware);
const postsController = container.get(PostsController);

export const postsRouter = Router();

postsRouter
  .get(
    '',
    postQueryValidation,
    validationResultMiddleware,
    postsController.getPostsHandler.bind(postsController),
  )

  .get(
    '/:id',
    idParamValidation,
    validationResultMiddleware,
    postsController.getPostByIdHandler.bind(postsController),
  )

  .post(
    '',
    basicAuthMiddleware,
    postValidation,
    validationResultMiddleware,
    postsController.createPostHandler.bind(postsController),
  )

  .put(
    '/:id',
    basicAuthMiddleware,
    idParamValidation,
    postValidation,
    validationResultMiddleware,
    postsController.updatePostHandler.bind(postsController),
  )

  .delete(
    '/:id',
    basicAuthMiddleware,
    idParamValidation,
    validationResultMiddleware,
    postsController.deletePostHandler.bind(postsController),
  )

  .get(
    '/:id/comments',
    idParamValidation,
    commentQueryValidation,
    validationResultMiddleware,
    postsController.getPostCommentsHandler.bind(postsController),
  )

  .post(
    '/:id/comments',
    bearerAuthMiddleware.handle.bind(bearerAuthMiddleware),
    idParamValidation,
    commentValidation,
    validationResultMiddleware,
    postsController.createPostCommentHandler.bind(postsController),
  );
