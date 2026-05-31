import { WithId } from 'mongodb';
import { Comment, CommentDb } from '../../types/comment.types';

export function mapCommentDbToCommentView(
  commentDb: WithId<CommentDb>,
): Comment {
  return {
    id: commentDb._id.toString(),
    content: commentDb.content,
    commentatorInfo: commentDb.commentatorInfo,
    createdAt: commentDb.createdAt,
  };
}
