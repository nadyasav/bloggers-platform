import { Request, Response } from 'express';
import { BlogInputDto } from '../../dto/blog-input.dto';
import { blogsService } from '../../application/blogs.service';
import { mapBlogDbToBlog } from '../mappers/blogdb-to-blog.mapper';

export async function createBlogHandler(
  req: Request<{}, {}, BlogInputDto>,
  res: Response,
) {
  const newBlog = await blogsService.create(req.body);
  res.status(201).send(mapBlogDbToBlog(newBlog));
}
