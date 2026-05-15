import { BlogInputDto } from '../dto/blog-input.dto';
import { BlogQueryDto } from '../dto/blog-query.dto';
import { blogsRepository } from '../repositories/blogs.repository';
import { BlogDb } from '../types/blog.types';
import { WithId } from 'mongodb';
import { postsRepository } from '../../posts/repositories/posts.repository';
import { NotFoundError } from '../../core/errors/not-found.error';
import { client } from '../../db/db';
import { BLOG_NOT_FOUND } from '../blog.constants';

export const blogsService = {
  async getAll(
    query: BlogQueryDto,
  ): Promise<{ blogs: WithId<BlogDb>[]; totalCount: number }> {
    return blogsRepository.getAll(query);
  },

  async getById(id: string): Promise<WithId<BlogDb> | null> {
    return blogsRepository.getById(id);
  },

  async create(dto: BlogInputDto): Promise<WithId<BlogDb>> {
    return blogsRepository.create(dto);
  },

  async update(id: string, dto: BlogInputDto): Promise<void> {
    const blog = await blogsRepository.getById(id);

    if (!blog) {
      throw new NotFoundError(BLOG_NOT_FOUND);
    }

    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        await blogsRepository.update(id, dto, session);

        if (blog.name !== dto.name) {
          await postsRepository.updateBlogNameField(id, dto.name, session);
        }
      });
    } finally {
      await session.endSession();
    }
  },

  async delete(id: string): Promise<void> {
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        await blogsRepository.delete(id, session);
        await postsRepository.deleteByBlogId(id, session);
      });
    } finally {
      await session.endSession();
    }
  },
};
