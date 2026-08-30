import { ObjectId, WithId } from 'mongodb';
import { commentsCollection } from '../../db/db';
import { CommentDb } from '../types/comment.types';
import { CommentQueryDto } from '../dto/comment-query.dto';

export class CommentsQueryRepository {
  async getById(id: string): Promise<WithId<CommentDb> | null> {
    return commentsCollection.findOne({ _id: new ObjectId(id) });
  }

  async getByPostId(
    postId: string,
    query: CommentQueryDto,
  ): Promise<{ comments: WithId<CommentDb>[]; totalCount: number }> {
    const skipCount = (query.pageNumber - 1) * query.pageSize;

    const totalCount = await commentsCollection.countDocuments({ postId });
    const comments = await commentsCollection
      .find({ postId })
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(skipCount)
      .limit(query.pageSize)
      .toArray();

    return { comments, totalCount };
  }
}
