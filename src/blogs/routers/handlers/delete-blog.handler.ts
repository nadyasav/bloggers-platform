import { Request, Response } from 'express';
import { blogsService } from '../../application/blogs.service';
import { NotFoundError } from '../../../core/errors/not-found.error';

export async function deleteBlogHandler(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    await blogsService.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.status(404).send({ message: error.message });
    }

    throw error;
  }
}
