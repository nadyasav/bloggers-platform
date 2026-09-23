import { WithId } from 'mongodb';
import { injectable } from 'inversify';
import { CommentModel } from '../domain/comment.entity';
import { CommentDb } from '../types/comment.types';
import { CommentQueryDto } from '../dto/comment-query.dto';

@injectable()
export class CommentsQueryRepository {
  async getById(id: string): Promise<WithId<CommentDb> | null> {
    return CommentModel.findOne({ _id: id }).lean();
  }

  async getByPostId(
    postId: string,
    query: CommentQueryDto,
  ): Promise<{ comments: WithId<CommentDb>[]; totalCount: number }> {
    const skipCount = (query.pageNumber - 1) * query.pageSize;

    const totalCount = await CommentModel.countDocuments({ postId });
    const comments = await CommentModel.find({ postId })
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(skipCount)
      .limit(query.pageSize)
      .lean();

    return { comments, totalCount };
  }
}
