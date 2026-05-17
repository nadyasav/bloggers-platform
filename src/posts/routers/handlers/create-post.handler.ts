import { Request, Response } from 'express';
import { PostInputDto } from '../../dto/post-input.dto';
import { mapPostDbToPost } from '../mappers/postdb-to-post.mapper';
import { postsService } from '../../application/posts.service';
import { BlogIdNotFoundError } from '../../errors/blog-id-not-found.error';

export async function createPostHandler(
  req: Request<{}, {}, PostInputDto>,
  res: Response,
) {
  try {
    const newPost = await postsService.create(req.body);
    res.status(201).send(mapPostDbToPost(newPost));
  } catch (error) {
    if (error instanceof BlogIdNotFoundError) {
      return res.status(error.statusCode).send({
        errorsMessages: [{ field: 'blogId', message: error.message }],
      });
    }

    throw error;
  }
}
