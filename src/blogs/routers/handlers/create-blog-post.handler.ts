import { Request, Response } from 'express';
import { BlogPostInputDto } from '../../../posts/dto/blog-post-input.dto';
import { postsService } from '../../../posts/application/posts.service';
import { mapPostDbToPost } from '../../../posts/routers/mappers/postdb-to-post.mapper';
import { BlogNotFoundError } from '../../errors/blog-not-found.error';

export async function createBlogPostHandler(
  req: Request<{ id: string }, {}, BlogPostInputDto>,
  res: Response,
) {
  try {
    const newPost = await postsService.createByBlogId(req.params.id, req.body);
    res.status(201).send(mapPostDbToPost(newPost));
  } catch (error) {
    if (error instanceof BlogNotFoundError) {
      return res.status(error.statusCode).send({ message: error.message });
    }

    throw error;
  }
}
