import { Request, Response } from 'express';
import { validateBlog } from '../../validation/blog.validation';
import { BlogInputDto } from '../../dto/blog-input.dto';
import { blogsRepository } from '../../repositories/blogs.repository';

export function createBlogHandler(
  req: Request<{}, {}, BlogInputDto>,
  res: Response,
) {
  const errors = validateBlog(req.body);

  if (errors.length > 0) {
    return res.status(400).send({ errorsMessages: errors });
  }

  const newBlog = blogsRepository.create(req.body);
  res.status(201).send(newBlog);
}
