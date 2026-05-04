import { Blog } from '../blogs/types/blog.types';
import { Post } from '../posts/types/post.types';

export const db = {
  blogs: new Map<string, Blog>(),
  nextBlogId: 0,
  posts: new Map<string, Post>(),
  nextPostId: 0,
};
