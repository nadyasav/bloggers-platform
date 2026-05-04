import { Request, Response } from 'express';
import { blogsRepository } from '../../repositories/blogs.repository';
import { postsRepository } from '../../../posts/repositories/posts.repository';
import { BlogInputDto } from '../../dto/blog-input.dto';
import { BLOG_NOT_FOUND } from '../../blog.constants';

export function updateBlogHandler(
  req: Request<{ id: string }, {}, BlogInputDto>,
  res: Response,
) {
  const blog = blogsRepository.getById(req.params.id);

  if (!blog) {
    return res.status(404).send({ message: BLOG_NOT_FOUND });
  }

  blogsRepository.update(blog, req.body);
  postsRepository.updateBlogNameField(blog.id, req.body.name);
  res.status(204).send();
}
