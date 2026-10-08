import { injectable } from 'inversify';
import { ClientSession } from 'mongodb';
import { COMMENT_ERRORS } from '../comment.constants';
import { CommentDocument, CommentModel } from '../domain/comment.entity';

@injectable()
export class CommentsRepository {
  async save(comment: CommentDocument, session?: ClientSession): Promise<void> {
    await comment.save({ session });
  }

  async incrementLikesCounters(
    id: string,
    likesDelta: number,
    dislikesDelta: number,
    session?: ClientSession,
  ): Promise<void> {
    await CommentModel.updateOne(
      { _id: id },
      {
        $inc: {
          'likesCounters.likesCount': likesDelta,
          'likesCounters.dislikesCount': dislikesDelta,
        },
      },
      { session },
    );
  }

  async getById(id: string): Promise<CommentDocument | null> {
    return CommentModel.findOne({ _id: id });
  }

  async delete(id: string): Promise<void> {
    const result = await CommentModel.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      throw new Error(COMMENT_ERRORS.NOT_FOUND);
    }
  }

  async deleteByPostId(postId: string, session?: ClientSession): Promise<void> {
    await CommentModel.deleteMany({ postId }, { session });
  }

  async deleteByPostIds(
    postIds: string[],
    session?: ClientSession,
  ): Promise<void> {
    await CommentModel.deleteMany({ postId: { $in: postIds } }, { session });
  }
}
