import { Request, Response } from 'express';
import { blogsRepository } from '../../repositories/blogs.repository';

export function getBlogsHandler(_req: Request, res: Response) {
  res.status(200).send(blogsRepository.getAll());
}
