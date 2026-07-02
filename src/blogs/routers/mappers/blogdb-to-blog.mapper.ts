import { WithId } from 'mongodb';
import { Blog, BlogDb } from '../../types/blog.types';

export function mapBlogDbToBlog(blogDb: WithId<BlogDb>): Blog {
  const { _id, ...rest } = blogDb;
  return { id: _id.toString(), ...rest };
}
