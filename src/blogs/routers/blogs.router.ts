import { Router } from 'express';
import { getBlogsHandler } from './handlers/get-blogs.handler';
import { getBlogByIdHandler } from './handlers/get-blog.handler';
import { createBlogHandler } from './handlers/create-blog.handler';
import { updateBlogHandler } from './handlers/update-blog.handler';
import { deleteBlogHandler } from './handlers/delete-blog.handler';
import { blogValidation } from '../validation/blog.validation';
import { validationResultMiddleware } from '../../core/middlewares/validation-result.middleware';
import { basicAuthMiddleware } from '../../core/middlewares/auth/basic-auth.middleware';
import { idParamValidation } from '../../core/validation/id-param.validation';
import { blogQueryValidation } from '../validation/blog-query.validation';
import { getBlogPostsHandler } from './handlers/get-blog-posts.handler';
import { postQueryValidation } from '../../posts/validation/post-query.validation';
import { createBlogPostHandler } from './handlers/create-blog-post.handler';
import { blogPostValidation } from '../../posts/validation/post.validation';

export const blogsRouter = Router();

blogsRouter
  .get('', blogQueryValidation, validationResultMiddleware, getBlogsHandler)

  .get(
    '/:id',
    idParamValidation,
    validationResultMiddleware,
    getBlogByIdHandler,
  )

  .get(
    '/:id/posts',
    idParamValidation,
    postQueryValidation,
    validationResultMiddleware,
    getBlogPostsHandler,
  )

  .post(
    '',
    basicAuthMiddleware,
    blogValidation,
    validationResultMiddleware,
    createBlogHandler,
  )

  .post(
    '/:id/posts',
    basicAuthMiddleware,
    idParamValidation,
    blogPostValidation,
    validationResultMiddleware,
    createBlogPostHandler,
  )

  .put(
    '/:id',
    basicAuthMiddleware,
    idParamValidation,
    blogValidation,
    validationResultMiddleware,
    updateBlogHandler,
  )

  .delete(
    '/:id',
    basicAuthMiddleware,
    idParamValidation,
    validationResultMiddleware,
    deleteBlogHandler,
  );
