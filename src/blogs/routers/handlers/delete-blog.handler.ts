import { Request, Response } from 'express';
import { blogsRepository } from '../../repositories/blogs.repository';
import { postsRepository } from '../../../posts/repositories/posts.repository';
import { NotFoundError } from '../../../core/errors/not-found.error';
import { client } from '../../../db/db';

export async function deleteBlogHandler(
  req: Request<{ id: string }>,
  res: Response,
) {
  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      await blogsRepository.delete(req.params.id, session);
      await postsRepository.deleteByBlogId(req.params.id, session);
    });

    res.status(204).send();
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.status(404).send({ message: error.message });
    }

    throw error;
  } finally {
    await session.endSession();
  }
}
