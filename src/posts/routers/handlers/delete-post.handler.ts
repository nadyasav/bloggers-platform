import { Request, Response } from 'express';
import { postsRepository } from '../../repositories/posts.repository';
import { NotFoundError } from '../../../core/errors/not-found.error';

export function deletePostHandler(req: Request<{ id: string }>, res: Response) {
  try {
    postsRepository.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.status(404).send({ message: error.message });
    }

    throw error;
  }
}
