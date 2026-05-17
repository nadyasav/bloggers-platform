import { Request, Response } from 'express';
import { postsService } from '../../application/posts.service';
import { PostNotFoundError } from '../../errors/post-not-found.error';

export async function deletePostHandler(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    await postsService.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    if (error instanceof PostNotFoundError) {
      return res.status(error.statusCode).send({ message: error.message });
    }

    throw error;
  }
}
