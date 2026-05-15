import { Request, Response } from 'express';
import { blogsService } from '../../application/blogs.service';
import { BLOG_NOT_FOUND } from '../../blog.constants';
import { mapBlogDbToBlog } from '../mappers/blogdb-to-blog.mapper';

export async function getBlogByIdHandler(
  req: Request<{ id: string }>,
  res: Response,
) {
  const blog = await blogsService.getById(req.params.id);

  if (!blog) {
    return res.status(404).send({ message: BLOG_NOT_FOUND });
  }

  res.status(200).send(mapBlogDbToBlog(blog));
}
