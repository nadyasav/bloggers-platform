import { Request, Response } from 'express';
import { blogsRepository } from '../../repositories/blogs.repository';
import { postsRepository } from '../../../posts/repositories/posts.repository';
import { BLOG_NOT_FOUND } from '../../blog.constants';

export function deleteBlogHandler(req: Request<{ id: string }>, res: Response) {
  const blog = blogsRepository.getById(req.params.id);

  if (!blog) {
    return res.status(404).send({ message: BLOG_NOT_FOUND });
  }

  postsRepository.deleteByBlogId(blog.id);
  blogsRepository.delete(blog.id);
  res.status(204).send();
}
