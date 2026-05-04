import { Request, Response } from 'express';
import { postsRepository } from '../../repositories/posts.repository';

export function getPostsHandler(_req: Request, res: Response) {
  res.status(200).send(postsRepository.getAll());
}
