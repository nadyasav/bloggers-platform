import { Request, Response } from 'express';
import { blogsRepository } from '../../repositories/blogs.repository';
import { NotFoundError } from '../../../core/errors/not-found.error';

export function deleteBlogHandler(req: Request<{ id: string }>, res: Response) {
  try {
    blogsRepository.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.status(404).send({ message: error.message });
    }

    throw error;
  }
}
