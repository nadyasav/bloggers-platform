import { Request, Response } from 'express';
import { BlogInputDto } from '../../dto/blog-input.dto';
import { blogsService } from '../../application/blogs.service';
import { BlogNotFoundError } from '../../errors/blog-not-found.error';

export async function updateBlogHandler(
  req: Request<{ id: string }, {}, BlogInputDto>,
  res: Response,
) {
  try {
    await blogsService.update(req.params.id, req.body);
    res.status(204).send();
  } catch (error) {
    if (error instanceof BlogNotFoundError) {
      return res.status(error.statusCode).send({ message: error.message });
    }

    throw error;
  }
}
