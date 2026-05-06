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

export const blogsRouter = Router();

blogsRouter
  .get('', getBlogsHandler)

  .get(
    '/:id',
    idParamValidation,
    validationResultMiddleware,
    getBlogByIdHandler,
  )

  .post(
    '',
    basicAuthMiddleware,
    blogValidation,
    validationResultMiddleware,
    createBlogHandler,
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
