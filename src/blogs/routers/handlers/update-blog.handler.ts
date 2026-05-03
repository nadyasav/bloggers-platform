import { Request, Response } from 'express';
import { blogsRepository } from '../../repositories/blogs.repository';
import { BlogInputDto } from '../../dto/blog-input.dto';
import { NotFoundError } from '../../../core/errors/not-found.error';

export function updateBlogHandler(
  req: Request<{ id: string }, {}, BlogInputDto>,
  res: Response,
) {
  try {
    blogsRepository.update(req.params.id, req.body);
    res.status(204).send();
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.status(404).send({ message: error.message });
    }

    throw error;
  }
}
