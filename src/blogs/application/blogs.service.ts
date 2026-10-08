import { inject, injectable } from 'inversify';
import { BlogInputDto } from '../dto/blog-input.dto';
import { BlogQueryDto } from '../dto/blog-query.dto';
import { BlogsRepository } from '../repositories/blogs.repository';
import { BlogDb } from '../types/blog.types';
import { WithId } from 'mongodb';
import { client } from '../../db/db';
import { BlogNotFoundError } from '../errors/blog-not-found.error';
import { PostsService } from '../../posts/application/posts.service';

@injectable()
export class BlogsService {
  private blogsRepository: BlogsRepository;
  private postsService: PostsService;

  constructor(
    @inject(BlogsRepository) blogsRepository: BlogsRepository,
    @inject(PostsService) postsService: PostsService,
  ) {
    this.blogsRepository = blogsRepository;
    this.postsService = postsService;
  }

  async getAll(
    query: BlogQueryDto,
  ): Promise<{ blogs: WithId<BlogDb>[]; totalCount: number }> {
    return this.blogsRepository.getAll(query);
  }

  async getById(id: string): Promise<WithId<BlogDb> | null> {
    return this.blogsRepository.getById(id);
  }

  async create(dto: BlogInputDto): Promise<WithId<BlogDb>> {
    return this.blogsRepository.create(dto);
  }

  async update(id: string, dto: BlogInputDto): Promise<void> {
    const blog = await this.blogsRepository.getById(id);

    if (!blog) {
      throw new BlogNotFoundError();
    }

    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        await this.blogsRepository.update(id, dto, session);

        if (blog.name !== dto.name) {
          await this.postsService.updateBlogNameField(id, dto.name, session);
        }
      });
    } finally {
      await session.endSession();
    }
  }

  async delete(id: string): Promise<void> {
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        await this.blogsRepository.delete(id, session);
        await this.postsService.deleteByBlogId(id, session);
      });
    } finally {
      await session.endSession();
    }
  }
}
