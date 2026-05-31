import { commentsCollection } from '../../db/db';
import { CommentDb } from '../types/comment.types';

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
};
