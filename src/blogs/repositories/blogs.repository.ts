import { db } from '../../db/db';
import { BlogInputDto } from '../dto/blog-input.dto';
import { Blog } from '../types/blog.types';
import { NotFoundError } from '../../core/errors/not-found.error';
import { BLOG_NOT_FOUND } from '../blog.constants';

export const blogsRepository = {
  getAll(): Blog[] {
    return Array.from(db.blogs.values());
  },
  getById(id: string): Blog | undefined {
    return db.blogs.get(id);
  },
  create(dto: BlogInputDto): Blog {
    const id = String(db.nextBlogId++);

    const newBlog: Blog = {
      id,
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    };

    db.blogs.set(id, newBlog);
    return newBlog;
  },
  update(id: string, dto: BlogInputDto): void {
    const blog = db.blogs.get(id);

    if (!blog) {
      throw new NotFoundError(BLOG_NOT_FOUND);
    }

    const updatedBlog: Blog = {
      ...blog,
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    };

    db.blogs.set(id, updatedBlog);
  },
  delete(id: string): void {
    if (!db.blogs.has(id)) {
      throw new NotFoundError(BLOG_NOT_FOUND);
    }

    db.blogs.delete(id);
  },
};
