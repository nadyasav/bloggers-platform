import { Blog } from '../blogs/types/blog.types';

export const db = {
  blogs: new Map<string, Blog>(),
  nextBlogId: 0,
};
