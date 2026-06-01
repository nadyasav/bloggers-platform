import { Result, ResultStatus } from '../../core/types/result.types';
import { postsRepository } from '../../posts/repositories/posts.repository';
import { usersRepository } from '../../users/repositories/users.repository';
import { commentsRepository } from '../repositories/comments.repository';
import { COMMENT_FORBIDDEN, COMMENT_NOT_FOUND } from '../comment.constants';
import { ClientSession } from 'mongodb';

export const commentsService = {
  async create(
    content: string,
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

    const id = await commentsRepository.create(
      content,
      postId,
      userId,
      user.login,
    );

    return { status: ResultStatus.Success, extensions: [], data: id };
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
        errorMessage: COMMENT_NOT_FOUND,
        extensions: [],
        data: null,
      };
    }

    if (comment.commentatorInfo.userId !== userId) {
      return {
        status: ResultStatus.Forbidden,
        errorMessage: COMMENT_FORBIDDEN,
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
