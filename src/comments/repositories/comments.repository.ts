import { commentsCollection } from '../../db/db';
import { CommentDb } from '../types/comment.types';
import { ClientSession, ObjectId, WithId } from 'mongodb';
import { COMMENT_NOT_FOUND } from '../comment.constants';

export const commentsRepository = {
  async create(
    content: string,
    postId: string,
    userId: string,
    userLogin: string,
  ): Promise<string> {
    const newComment: CommentDb = {
      content,
      postId,
      commentatorInfo: { userId, userLogin },
      createdAt: new Date(),
    };

    const result = await commentsCollection.insertOne(newComment);
    return result.insertedId.toString();
  },

  async getById(id: string): Promise<WithId<CommentDb> | null> {
    return commentsCollection.findOne({ _id: new ObjectId(id) });
  },

  async delete(id: string): Promise<void> {
    const result = await commentsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      throw new Error(COMMENT_NOT_FOUND);
    }
  },

  async deleteByPostId(postId: string, session?: ClientSession): Promise<void> {
    await commentsCollection.deleteMany({ postId }, { session });
  },

  async deleteByPostIds(
    postIds: string[],
    session?: ClientSession,
  ): Promise<void> {
    await commentsCollection.deleteMany(
      { postId: { $in: postIds } },
      { session },
    );
  },
};
