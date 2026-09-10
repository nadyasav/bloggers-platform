import { inject, injectable } from 'inversify';
import { Result, ResultStatus } from '../../core/types/result.types';
import { PostsRepository } from '../../posts/repositories/posts.repository';
import { UsersRepository } from '../../users/repositories/users.repository';
import { CommentsRepository } from '../repositories/comments.repository';
import { COMMENT_ERRORS } from '../comment.constants';
import { ClientSession } from 'mongodb';
import { CommentInputDto } from '../dto/comment-input.dto';

@injectable()
export class CommentsService {
  private commentsRepository: CommentsRepository;
  private postsRepository: PostsRepository;
  private usersRepository: UsersRepository;

  constructor(
    @inject(CommentsRepository) commentsRepository: CommentsRepository,
    @inject(PostsRepository) postsRepository: PostsRepository,
    @inject(UsersRepository) usersRepository: UsersRepository,
  ) {
    this.commentsRepository = commentsRepository;
    this.postsRepository = postsRepository;
    this.usersRepository = usersRepository;
  }

  async create(
    dto: CommentInputDto,
    postId: string,
    userId: string,
  ): Promise<Result<string | null>> {
    const user = await this.usersRepository.getById(userId);

    if (!user) {
      return { status: ResultStatus.Unauthorized, extensions: [], data: null };
    }

    const post = await this.postsRepository.getById(postId);

    if (!post) {
      return {
        status: ResultStatus.NotFound,
        errorMessage: 'Post not found',
        extensions: [],
        data: null,
      };
    }

    const id = await this.commentsRepository.create(
      dto,
      postId,
      userId,
      user.login,
    );

    return { status: ResultStatus.Success, extensions: [], data: id };
  }

  async update(
    id: string,
    dto: CommentInputDto,
    userId: string,
  ): Promise<Result<null>> {
    const user = await this.usersRepository.getById(userId);

    if (!user) {
      return { status: ResultStatus.Unauthorized, extensions: [], data: null };
    }

    const comment = await this.commentsRepository.getById(id);

    if (!comment) {
      return {
        status: ResultStatus.NotFound,
        errorMessage: COMMENT_ERRORS.NOT_FOUND,
        extensions: [],
        data: null,
      };
    }

    if (comment.commentatorInfo.userId !== userId) {
      return {
        status: ResultStatus.Forbidden,
        errorMessage: COMMENT_ERRORS.UPDATE_FORBIDDEN,
        extensions: [],
        data: null,
      };
    }

    await this.commentsRepository.update(id, dto);

    return { status: ResultStatus.Success, extensions: [], data: null };
  }

  async delete(id: string, userId: string): Promise<Result<null>> {
    const user = await this.usersRepository.getById(userId);

    if (!user) {
      return { status: ResultStatus.Unauthorized, extensions: [], data: null };
    }

    const comment = await this.commentsRepository.getById(id);

    if (!comment) {
      return {
        status: ResultStatus.NotFound,
        errorMessage: COMMENT_ERRORS.NOT_FOUND,
        extensions: [],
        data: null,
      };
    }

    if (comment.commentatorInfo.userId !== userId) {
      return {
        status: ResultStatus.Forbidden,
        errorMessage: COMMENT_ERRORS.DELETE_FORBIDDEN,
        extensions: [],
        data: null,
      };
    }

    await this.commentsRepository.delete(id);

    return { status: ResultStatus.Success, extensions: [], data: null };
  }

  async deleteByPostId(postId: string, session?: ClientSession): Promise<void> {
    await this.commentsRepository.deleteByPostId(postId, session);
  }

  async deleteByPostIds(
    postIds: string[],
    session?: ClientSession,
  ): Promise<void> {
    await this.commentsRepository.deleteByPostIds(postIds, session);
  }
}
