import { Request, Response } from 'express';
import { PostInputDto } from '../../dto/post-input.dto';
import { postsRepository } from '../../repositories/posts.repository';
import { blogsRepository } from '../../../blogs/repositories/blogs.repository';
import { mapPostDbToPost } from '../mappers/postdb-to-post.mapper';

export async function createPostHandler(
  req: Request<{}, {}, PostInputDto>,
  res: Response,
) {
  const blog = await blogsRepository.getById(req.body.blogId);

  if (!blog) {
    return res.status(400).send({
      errorsMessages: [{ field: 'blogId', message: 'Blog not found' }],
    });
  }

  const newPost = await postsRepository.create(req.body, blog.name);
  res.status(201).send(mapPostDbToPost(newPost));
}
