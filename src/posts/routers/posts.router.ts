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

export const postsRouter = Router();

postsRouter
  .get('', getPostsHandler)

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
  );
