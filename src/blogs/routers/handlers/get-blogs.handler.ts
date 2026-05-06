import { Request, Response } from 'express';
import { blogsRepository } from '../../repositories/blogs.repository';
import { mapBlogDbToBlog } from '../mappers/blogdb-to-blog.mapper';

export async function getBlogsHandler(_req: Request, res: Response) {
  const blogs = await blogsRepository.getAll();
  res.status(200).send(blogs.map(mapBlogDbToBlog));
}
