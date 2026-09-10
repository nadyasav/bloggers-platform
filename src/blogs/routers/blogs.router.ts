import { Router } from 'express';
import { blogValidation } from '../validation/blog.validation';
import { validationResultMiddleware } from '../../core/middlewares/validation-result.middleware';
import { basicAuthMiddleware } from '../../core/middlewares/auth/basic-auth.middleware';
import { idParamValidation } from '../../core/validation/id-param.validation';
import { blogQueryValidation } from '../validation/blog-query.validation';
import { postQueryValidation } from '../../posts/validation/post-query.validation';
import { blogPostValidation } from '../../posts/validation/post.validation';
import { container } from '../../composition-root';
import { BlogsController } from './blogs.controller';

const blogsController = container.get(BlogsController);

export const blogsRouter = Router();

blogsRouter
  .get(
    '',
    blogQueryValidation,
    validationResultMiddleware,
    blogsController.getBlogsHandler.bind(blogsController),
  )

  .get(
    '/:id',
    idParamValidation,
    validationResultMiddleware,
    blogsController.getBlogByIdHandler.bind(blogsController),
  )

  .get(
    '/:id/posts',
    idParamValidation,
    postQueryValidation,
    validationResultMiddleware,
    blogsController.getBlogPostsHandler.bind(blogsController),
  )

  .post(
    '',
    basicAuthMiddleware,
    blogValidation,
    validationResultMiddleware,
    blogsController.createBlogHandler.bind(blogsController),
  )

  .post(
    '/:id/posts',
    basicAuthMiddleware,
    idParamValidation,
    blogPostValidation,
    validationResultMiddleware,
    blogsController.createBlogPostHandler.bind(blogsController),
  )

  .put(
    '/:id',
    basicAuthMiddleware,
    idParamValidation,
    blogValidation,
    validationResultMiddleware,
    blogsController.updateBlogHandler.bind(blogsController),
  )

  .delete(
    '/:id',
    basicAuthMiddleware,
    idParamValidation,
    validationResultMiddleware,
    blogsController.deleteBlogHandler.bind(blogsController),
  );
