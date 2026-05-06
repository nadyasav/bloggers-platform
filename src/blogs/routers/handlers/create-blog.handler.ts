import { Request, Response } from 'express';
import { BlogInputDto } from '../../dto/blog-input.dto';
import { blogsRepository } from '../../repositories/blogs.repository';
import { mapBlogDbToBlog } from '../mappers/blogdb-to-blog.mapper';

export async function createBlogHandler(
  req: Request<{}, {}, BlogInputDto>,
  res: Response,
) {
  const newBlog = await blogsRepository.create(req.body);
  res.status(201).send(mapBlogDbToBlog(newBlog));
}
