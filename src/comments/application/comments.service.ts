import { Result, ResultStatus } from '../../core/types/result.types';
import { postsRepository } from '../../posts/repositories/posts.repository';
import { usersRepository } from '../../users/repositories/users.repository';
import { commentsRepository } from '../repositories/comments.repository';

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
};
