import { Request, Response } from 'express';
import { blogsRepository } from '../../repositories/blogs.repository';
import { postsRepository } from '../../../posts/repositories/posts.repository';
import { BlogInputDto } from '../../dto/blog-input.dto';
import { NotFoundError } from '../../../core/errors/not-found.error';

export async function updateBlogHandler(
  req: Request<{ id: string }, {}, BlogInputDto>,
  res: Response,
) {
  try {
    await blogsRepository.update(req.params.id, req.body);
    await postsRepository.updateBlogNameField(req.params.id, req.body.name);
    res.status(204).send();
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.status(404).send({ message: error.message });
    }

    throw error;
  }
}
