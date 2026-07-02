import { Router } from 'express';
import { getPostsHandler } from './handlers/get-posts.handler';
import { getPostByIdHandler } from './handlers/get-post.handler';
import { createPostHandler } from './handlers/create-post.handler';
import { deletePostHandler } from './handlers/delete-post.handler';
import { updatePostHandler } from './handlers/update-post.handler';
import { basicAuthMiddleware } from '../../core/middlewares/auth/basic-auth.middleware';
import { postValidation } from '../validation/post.validation';
import { validationResultMiddleware } from '../../core/middlewares/validation-result.middleware';
import { idParamValidation } from '../../core/validation/id-param.validation';
import { postQueryValidation } from '../validation/post-query.validation';
import { createPostCommentHandler } from './handlers/create-post-comment.handler';
import { bearerAuthMiddleware } from '../../core/middlewares/auth/bearer-auth.middleware';
import { commentValidation } from '../../comments/validation/comment.validation';
import { commentQueryValidation } from '../../comments/validation/comment-query.validation';
import { getPostCommentsHandler } from './handlers/get-post-comments.handler';

export const postsRouter = Router();

postsRouter
  .get('', postQueryValidation, validationResultMiddleware, getPostsHandler)

  .get(
    '/:id',
    idParamValidation,
    validationResultMiddleware,
    getPostByIdHandler,
  )

  .post(
    '',
    basicAuthMiddleware,
    postValidation,
    validationResultMiddleware,
    createPostHandler,
  )

  .put(
    '/:id',
    basicAuthMiddleware,
    idParamValidation,
    postValidation,
    validationResultMiddleware,
    updatePostHandler,
  )

  .delete(
    '/:id',
    basicAuthMiddleware,
    idParamValidation,
    validationResultMiddleware,
    deletePostHandler,
  )

  .get(
    '/:id/comments',
    idParamValidation,
    commentQueryValidation,
    validationResultMiddleware,
    getPostCommentsHandler,
  )

  .post(
    '/:id/comments',
    bearerAuthMiddleware,
    idParamValidation,
    commentValidation,
    validationResultMiddleware,
    createPostCommentHandler,
  );
