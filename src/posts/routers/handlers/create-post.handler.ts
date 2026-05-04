import { Request, Response } from 'express';
import { PostInputDto } from '../../dto/post-input.dto';
import { postsRepository } from '../../repositories/posts.repository';
import { blogsRepository } from '../../../blogs/repositories/blogs.repository';

export function createPostHandler(
  req: Request<{}, {}, PostInputDto>,
  res: Response,
) {
  const blog = blogsRepository.getById(req.body.blogId);

  if (!blog) {
    return res.status(400).send({
      errorsMessages: [{ field: 'blogId', message: 'Blog not found' }],
    });
  }

  const newPost = postsRepository.create(req.body, blog.name);
  res.status(201).send(newPost);
}
