import { Request, Response } from 'express';
import { PostInputDto } from '../../dto/post-input.dto';
import { postsRepository } from '../../repositories/posts.repository';
import { blogsRepository } from '../../../blogs/repositories/blogs.repository';
import { NotFoundError } from '../../../core/errors/not-found.error';

export async function updatePostHandler(
  req: Request<{ id: string }, {}, PostInputDto>,
  res: Response,
) {
  const blog = await blogsRepository.getById(req.body.blogId);

  if (!blog) {
    return res.status(400).send({
      errorsMessages: [{ field: 'blogId', message: 'Blog not found' }],
    });
  }

  try {
    await postsRepository.update(req.params.id, req.body, blog.name);
    res.status(204).send();
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.status(404).send({ message: error.message });
    }

    throw error;
  }
}
