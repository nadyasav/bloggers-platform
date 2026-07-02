import { Request, Response } from 'express';
import { blogsService } from '../../application/blogs.service';
import { BlogNotFoundError } from '../../errors/blog-not-found.error';

export async function deleteBlogHandler(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    await blogsService.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    if (error instanceof BlogNotFoundError) {
      return res.status(error.statusCode).send({ message: error.message });
    }

    throw error;
  }
}
