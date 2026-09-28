import { Comment, CommentDbWithStatus } from '../../types/comment.types';

export function mapCommentDbToCommentView(
  commentDb: CommentDbWithStatus,
): Comment {
  return {
    id: commentDb._id.toString(),
    content: commentDb.content,
    commentatorInfo: commentDb.commentatorInfo,
    createdAt: commentDb.createdAt,
    likesInfo: {
      likesCount: commentDb.likesCounters.likesCount,
      dislikesCount: commentDb.likesCounters.dislikesCount,
      myStatus: commentDb.myStatus,
    },
  };
}
