import { Request, Response } from 'express';
import { blogsRepository } from '../../repositories/blogs.repository';
import { postsRepository } from '../../../posts/repositories/posts.repository';
import { BlogInputDto } from '../../dto/blog-input.dto';
import { NotFoundError } from '../../../core/errors/not-found.error';
import { client } from '../../../db/db';
import { BLOG_NOT_FOUND } from '../../blog.constants';

export async function updateBlogHandler(
  req: Request<{ id: string }, {}, BlogInputDto>,
  res: Response,
) {
  const blog = await blogsRepository.getById(req.params.id);

  if (!blog) {
    return res.status(404).send({ message: BLOG_NOT_FOUND });
  }

  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      await blogsRepository.update(req.params.id, req.body, session);

      if (blog.name !== req.body.name) {
        await postsRepository.updateBlogNameField(
          req.params.id,
          req.body.name,
          session,
        );
      }
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
