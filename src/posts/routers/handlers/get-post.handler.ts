import { Request, Response } from 'express';
import { postsRepository } from '../../repositories/posts.repository';
import { POST_NOT_FOUND } from '../../post.constants';

export function getPostByIdHandler(
  req: Request<{ id: string }>,
  res: Response,
) {
  const post = postsRepository.getById(req.params.id);

  if (!post) {
    return res.status(404).send({ message: POST_NOT_FOUND });
  }

  res.status(200).send(post);
}
