import { db } from '../../db/db';
import { PostInputDto } from '../dto/post-input.dto';
import { Post } from '../types/post.types';
import { NotFoundError } from '../../core/errors/not-found.error';
import { POST_NOT_FOUND } from '../post.constants';

export const postsRepository = {
  getAll(): Post[] {
    return Array.from(db.posts.values());
  },
  getById(id: string): Post | undefined {
    return db.posts.get(id);
  },
  create(dto: PostInputDto, blogName: string): Post {
    const id = String(db.nextPostId++);

    const newPost = {
      id,
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
      blogName,
    };

    db.posts.set(id, newPost);
    return newPost;
  },
  update(id: string, dto: PostInputDto, blogName: string): void {
    const post = db.posts.get(id);

    if (!post) {
      throw new NotFoundError(POST_NOT_FOUND);
    }

    const updatedPost = {
      ...post,
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
      blogName,
    };

    db.posts.set(id, updatedPost);
  },
  delete(id: string): void {
    if (!db.posts.has(id)) {
      throw new NotFoundError(POST_NOT_FOUND);
    }

    db.posts.delete(id);
  },
  updateBlogNameField(blogId: string, blogName: string): void {
    db.posts.forEach((post, id) => {
      if (post.blogId === blogId) {
        db.posts.set(id, { ...post, blogName });
      }
    });
  },
  deleteByBlogId(blogId: string): void {
    db.posts.forEach((post, id) => {
      if (post.blogId === blogId) {
        db.posts.delete(id);
      }
    });
  },
};
