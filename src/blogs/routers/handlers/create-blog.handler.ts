import { Request, Response } from 'express';
import { BlogInputDto } from '../../dto/blog-input.dto';
import { blogsRepository } from '../../repositories/blogs.repository';

export function createBlogHandler(
  req: Request<{}, {}, BlogInputDto>,
  res: Response,
) {
  const newBlog = blogsRepository.create(req.body);
  res.status(201).send(newBlog);
}
