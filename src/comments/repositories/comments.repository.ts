import { commentsCollection } from '../../db/db';
import { CommentDb } from '../types/comment.types';
import { ClientSession, ObjectId, WithId } from 'mongodb';
import { COMMENT_ERRORS } from '../comment.constants';
import { CommentInputDto } from '../dto/comment-input.dto';

export class CommentsRepository {
  async create(
    dto: CommentInputDto,
    postId: string,
    userId: string,
    userLogin: string,
  ): Promise<string> {
    const newComment: CommentDb = {
      content: dto.content,
      postId,
      commentatorInfo: { userId, userLogin },
      createdAt: new Date(),
    };

    const result = await commentsCollection.insertOne(newComment);
    return result.insertedId.toString();
  }

  async getById(id: string): Promise<WithId<CommentDb> | null> {
    return commentsCollection.findOne({ _id: new ObjectId(id) });
  }

  async update(id: string, dto: CommentInputDto): Promise<void> {
    const result = await commentsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { content: dto.content } },
    );

    if (result.matchedCount === 0) {
      throw new Error(COMMENT_ERRORS.NOT_FOUND);
    }
  }

  async delete(id: string): Promise<void> {
    const result = await commentsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      throw new Error(COMMENT_ERRORS.NOT_FOUND);
    }
  }

  async deleteByPostId(postId: string, session?: ClientSession): Promise<void> {
    await commentsCollection.deleteMany({ postId }, { session });
  }

  async deleteByPostIds(
    postIds: string[],
    session?: ClientSession,
  ): Promise<void> {
    await commentsCollection.deleteMany(
      { postId: { $in: postIds } },
      { session },
    );
  }
}
