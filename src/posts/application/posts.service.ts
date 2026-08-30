import { PostQueryDto } from '../dto/post-query.dto';
import { PostsRepository } from '../repositories/posts.repository';
import { PostDb } from '../types/post.types';
import { WithId } from 'mongodb';
import { PostInputDto } from '../dto/post-input.dto';
import { BlogIdNotFoundError } from '../errors/blog-id-not-found.error';
import { BlogPostInputDto } from '../dto/blog-post-input.dto';
import { BlogNotFoundError } from '../../blogs/errors/blog-not-found.error';
import { client } from '../../db/db';
import { ClientSession } from 'mongodb';
import { CommentsService } from '../../comments/application/comments.service';
import { BlogsRepository } from '../../blogs/repositories/blogs.repository';

export class PostsService {
  private postsRepository: PostsRepository;
  private blogsRepository: BlogsRepository;
  private commentsService: CommentsService;

  constructor(
    postsRepository: PostsRepository,
    blogsRepository: BlogsRepository,
    commentsService: CommentsService,
  ) {
    this.postsRepository = postsRepository;
    this.blogsRepository = blogsRepository;
    this.commentsService = commentsService;
  }

  async getAll(
    query: PostQueryDto,
    blogId?: string,
  ): Promise<{ posts: WithId<PostDb>[]; totalCount: number }> {
    if (blogId) {
      const blog = await this.blogsRepository.getById(blogId);

      if (!blog) {
        throw new BlogNotFoundError();
      }
    }

    return this.postsRepository.getAll(query, blogId);
  }

  async getById(id: string): Promise<WithId<PostDb> | null> {
    return this.postsRepository.getById(id);
  }

  async create(dto: PostInputDto): Promise<WithId<PostDb>> {
    const blog = await this.blogsRepository.getById(dto.blogId);

    if (!blog) {
      throw new BlogIdNotFoundError();
    }

    return this.postsRepository.create(dto, blog.name);
  }

  async createByBlogId(
    blogId: string,
    dto: BlogPostInputDto,
  ): Promise<WithId<PostDb>> {
    const blog = await this.blogsRepository.getById(blogId);

    if (!blog) {
      throw new BlogNotFoundError();
    }

    return this.postsRepository.create({ ...dto, blogId }, blog.name);
  }

  async update(id: string, dto: PostInputDto): Promise<void> {
    const blog = await this.blogsRepository.getById(dto.blogId);

    if (!blog) {
      throw new BlogIdNotFoundError();
    }

    await this.postsRepository.update(id, dto, blog.name);
  }

  async updateBlogNameField(
    blogId: string,
    blogName: string,
    session?: ClientSession,
  ): Promise<void> {
    await this.postsRepository.updateBlogNameField(blogId, blogName, session);
  }

  async deleteByBlogId(blogId: string, session?: ClientSession): Promise<void> {
    const postIds = await this.postsRepository.getIdsByBlogId(blogId, session);

    await this.commentsService.deleteByPostIds(postIds, session);
    await this.postsRepository.deleteByBlogId(blogId, session);
  }

  async delete(id: string): Promise<void> {
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        await this.postsRepository.delete(id);
        await this.commentsService.deleteByPostId(id, session);
      });
    } finally {
      await session.endSession();
    }
  }
}
