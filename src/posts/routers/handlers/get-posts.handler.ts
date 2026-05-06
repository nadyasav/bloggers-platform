import { Request, Response } from 'express';
import { postsRepository } from '../../repositories/posts.repository';
import { mapPostDbToPost } from '../mappers/postdb-to-post.mapper';

export async function getPostsHandler(_req: Request, res: Response) {
  const posts = await postsRepository.getAll();
  res.status(200).send(posts.map(mapPostDbToPost));
}
