import { Router } from 'express';
import { getBlogsHandler } from './handlers/get-blogs.handler';
import { getBlogByIdHandler } from './handlers/get-blog.handler';
import { createBlogHandler } from './handlers/create-blog.handler';
import { updateBlogHandler } from './handlers/update-blog.handler';
import { deleteBlogHandler } from './handlers/delete-blog.handler';

export const blogsRouter = Router();

blogsRouter
  .get('', getBlogsHandler)

  .get('/:id', getBlogByIdHandler)

  .post('', createBlogHandler)

  .put('/:id', updateBlogHandler)

  .delete('/:id', deleteBlogHandler);
