import { Request, Response } from 'express';
import { PostInputDto } from '../../dto/post-input.dto';
import { postsService } from '../../application/posts.service';
import { PostNotFoundError } from '../../errors/post-not-found.error';
import { BlogIdNotFoundError } from '../../errors/blog-id-not-found.error';

export async function updatePostHandler(
  req: Request<{ id: string }, {}, PostInputDto>,
  res: Response,
) {
  try {
    await postsService.update(req.params.id, req.body);
    res.status(204).send();
  } catch (error) {
    if (error instanceof PostNotFoundError) {
      return res.status(error.statusCode).send({ message: error.message });
    }

    if (error instanceof BlogIdNotFoundError) {
      return res.status(error.statusCode).send({
        errorsMessages: [{ field: 'blogId', message: error.message }],
      });
    }

    throw error;
  }
}
