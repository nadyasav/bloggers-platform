import { Result, ResultStatus } from '../../core/types/result.types';
import { postsRepository } from '../../posts/repositories/posts.repository';
import { usersRepository } from '../../users/repositories/users.repository';
import { commentsRepository } from '../repositories/comments.repository';
import { COMMENT_ERRORS } from '../comment.constants';
import { ClientSession } from 'mongodb';
import { CommentInputDto } from '../dto/comment-input.dto';

export const commentsService = {
  async create(
    dto: CommentInputDto,
    postId: string,
    userId: string,
  ): Promise<Result<string | null>> {
    const user = await usersRepository.getById(userId);

    if (!user) {
      return { status: ResultStatus.Unauthorized, extensions: [], data: null };
    }

    const post = await postsRepository.getById(postId);

    if (!post) {
      return {
        status: ResultStatus.NotFound,
        errorMessage: 'Post not found',
        extensions: [],
        data: null,
      };
    }

    const id = await commentsRepository.create(dto, postId, userId, user.login);

    return { status: ResultStatus.Success, extensions: [], data: id };
  },

  async update(
    id: string,
    dto: CommentInputDto,
    userId: string,
  ): Promise<Result<null>> {
    const user = await usersRepository.getById(userId);

    if (!user) {
      return { status: ResultStatus.Unauthorized, extensions: [], data: null };
    }

    const comment = await commentsRepository.getById(id);

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

    await commentsRepository.update(id, dto);

    return { status: ResultStatus.Success, extensions: [], data: null };
  },

  async delete(id: string, userId: string): Promise<Result<null>> {
    const user = await usersRepository.getById(userId);

    if (!user) {
      return { status: ResultStatus.Unauthorized, extensions: [], data: null };
    }

    const comment = await commentsRepository.getById(id);

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

    await commentsRepository.delete(id);

    return { status: ResultStatus.Success, extensions: [], data: null };
  },

  async deleteByPostId(postId: string, session?: ClientSession): Promise<void> {
    await commentsRepository.deleteByPostId(postId, session);
  },

  async deleteByPostIds(
    postIds: string[],
    session?: ClientSession,
  ): Promise<void> {
    await commentsRepository.deleteByPostIds(postIds, session);
  },
};
