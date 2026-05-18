import { PostQueryDto } from '../dto/post-query.dto';
import { postsRepository } from '../repositories/posts.repository';
import { PostDb } from '../types/post.types';
import { WithId } from 'mongodb';
import { PostInputDto } from '../dto/post-input.dto';
import { blogsRepository } from '../../blogs/repositories/blogs.repository';
import { BlogIdNotFoundError } from '../errors/blog-id-not-found.error';
import { BlogPostInputDto } from '../dto/blog-post-input.dto';
import { BlogNotFoundError } from '../../blogs/errors/blog-not-found.error';

export const postsService = {
  async getAll(
    query: PostQueryDto,
    blogId?: string,
  ): Promise<{ posts: WithId<PostDb>[]; totalCount: number }> {
    if (blogId) {
      const blog = await blogsRepository.getById(blogId);

      if (!blog) {
        throw new BlogNotFoundError();
      }
    }

    return postsRepository.getAll(query, blogId);
  },

  async getById(id: string): Promise<WithId<PostDb> | null> {
    return postsRepository.getById(id);
  },

  async create(dto: PostInputDto): Promise<WithId<PostDb>> {
    const blog = await blogsRepository.getById(dto.blogId);

    if (!blog) {
      throw new BlogIdNotFoundError();
    }

    return postsRepository.create(dto, blog.name);
  },

  async createByBlogId(
    blogId: string,
    dto: BlogPostInputDto,
  ): Promise<WithId<PostDb>> {
    const blog = await blogsRepository.getById(blogId);

    if (!blog) {
      throw new BlogNotFoundError();
    }

    return postsRepository.create({ ...dto, blogId }, blog.name);
  },

  async update(id: string, dto: PostInputDto): Promise<void> {
    const blog = await blogsRepository.getById(dto.blogId);

    if (!blog) {
      throw new BlogIdNotFoundError();
    }

    await postsRepository.update(id, dto, blog.name);
  },

  async delete(id: string): Promise<void> {
    await postsRepository.delete(id);
  },
};
