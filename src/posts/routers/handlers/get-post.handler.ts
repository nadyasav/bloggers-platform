import { Request, Response } from 'express';
import { postsRepository } from '../../repositories/posts.repository';
import { POST_NOT_FOUND } from '../../post.constants';
import { mapPostDbToPost } from '../mappers/postdb-to-post.mapper';

export async function getPostByIdHandler(
  req: Request<{ id: string }>,
  res: Response,
) {
  const post = await postsRepository.getById(req.params.id);

  if (!post) {
    return res.status(404).send({ message: POST_NOT_FOUND });
  }

  res.status(200).send(mapPostDbToPost(post));
}
