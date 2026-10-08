import { inject, injectable } from 'inversify';
import { Result, ResultStatus } from '../../core/types/result.types';
import { PostsRepository } from '../../posts/repositories/posts.repository';
import { UsersRepository } from '../../users/repositories/users.repository';
import { CommentsRepository } from '../repositories/comments.repository';
import { COMMENT_ERRORS } from '../comment.constants';
import { ClientSession } from 'mongodb';
import { CommentInputDto } from '../dto/comment-input.dto';
import { CommentModel } from '../domain/comment.entity';
import { LikeInputDto } from '../../likes/dto/like-input.dto';
import { LikesRepository } from '../../likes/repositories/likes.repository';
import { client } from '../../db/db';
import { LikeStatus } from '../../likes/types/like.types';

@injectable()
export class CommentsService {
  private commentsRepository: CommentsRepository;
  private postsRepository: PostsRepository;
  private usersRepository: UsersRepository;
  private likesRepository: LikesRepository;

  constructor(
    @inject(CommentsRepository) commentsRepository: CommentsRepository,
    @inject(PostsRepository) postsRepository: PostsRepository,
    @inject(UsersRepository) usersRepository: UsersRepository,
    @inject(LikesRepository) likesRepository: LikesRepository,
  ) {
    this.commentsRepository = commentsRepository;
    this.postsRepository = postsRepository;
    this.usersRepository = usersRepository;
    this.likesRepository = likesRepository;
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

    const comment = new CommentModel({
      content: dto.content,
      postId,
      commentatorInfo: { userId, userLogin: user.login },
      createdAt: new Date(),
    });

    await this.commentsRepository.save(comment);

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: comment._id.toString(),
    };
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

    comment.content = dto.content;

    await this.commentsRepository.save(comment);

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

  async updateLikeStatus(
    id: string,
    dto: LikeInputDto,
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

    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        const prevLikeStatus =
          await this.likesRepository.updateAndGetPrevStatus(
            id,
            userId,
            dto.likeStatus,
            session,
          );

        let likesDelta = 0;
        let dislikesDelta = 0;

        if (prevLikeStatus === LikeStatus.Like) {
          likesDelta -= 1;
        }

        if (prevLikeStatus === LikeStatus.Dislike) {
          dislikesDelta -= 1;
        }

        if (dto.likeStatus === LikeStatus.Like) {
          likesDelta += 1;
        }

        if (dto.likeStatus === LikeStatus.Dislike) {
          dislikesDelta += 1;
        }

        if (likesDelta !== 0 || dislikesDelta !== 0) {
          await this.commentsRepository.incrementLikesCounters(
            id,
            likesDelta,
            dislikesDelta,
            session,
          );
        }
      });
    } finally {
      await session.endSession();
    }

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
