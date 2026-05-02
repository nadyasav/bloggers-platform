import { Request, Response } from 'express';
import { blogsRepository } from '../../repositories/blogs.repository';
import { BLOG_NOT_FOUND } from '../../blog.constants';

export function getBlogByIdHandler(
  req: Request<{ id: string }>,
  res: Response,
) {
  const blog = blogsRepository.getById(req.params.id);

  if (!blog) {
    return res.status(404).send({ message: BLOG_NOT_FOUND });
  }

  res.status(200).send(blog);
}
