import { injectable } from 'inversify';
import { CommentModel } from '../domain/comment.entity';
import { CommentDbWithStatus } from '../types/comment.types';
import { CommentQueryDto } from '../dto/comment-query.dto';
import { LikeModel } from '../../likes/domain/like.entity';
import { LikeStatus } from '../../likes/types/like.types';

@injectable()
export class CommentsQueryRepository {
  async getById(
    id: string,
    userId?: string,
  ): Promise<CommentDbWithStatus | null> {
    const comment = await CommentModel.findOne({ _id: id }).lean();

    if (!comment) {
      return null;
    }

    const like = userId
      ? await LikeModel.findOne({ parentId: id, authorId: userId }).lean()
      : null;

    return { ...comment, myStatus: like?.status ?? LikeStatus.None };
  }

  async getByPostId(
    postId: string,
    query: CommentQueryDto,
    userId?: string,
  ): Promise<{ comments: CommentDbWithStatus[]; totalCount: number }> {
    const skipCount = (query.pageNumber - 1) * query.pageSize;

    const totalCount = await CommentModel.countDocuments({ postId });
    const comments = await CommentModel.find({ postId })
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(skipCount)
      .limit(query.pageSize)
      .lean();

    const commentIds = comments.map((comment) => comment._id.toString());
    let likeStatusesByCommentId: Map<string, LikeStatus> = new Map();

    if (userId && commentIds.length > 0) {
      likeStatusesByCommentId = await this.getUserLikeStatuses(
        commentIds,
        userId,
      );
    }

    const commentsWithStatus = comments.map((comment) => ({
      ...comment,
      myStatus:
        likeStatusesByCommentId.get(comment._id.toString()) ?? LikeStatus.None,
    }));

    return { comments: commentsWithStatus, totalCount };
  }

  private async getUserLikeStatuses(
    commentIds: string[],
    authorId: string,
  ): Promise<Map<string, LikeStatus>> {
    const likes = await LikeModel.find({
      parentId: { $in: commentIds },
      authorId,
    }).lean();

    const likeStatusesByCommentId = new Map(
      likes.map((like) => [like.parentId, like.status]),
    );

    return likeStatusesByCommentId;
  }
}
