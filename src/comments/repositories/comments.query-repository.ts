import { ObjectId, WithId } from 'mongodb';
import { commentsCollection } from '../../db/db';
import { CommentDb } from '../types/comment.types';

export const commentsQueryRepository = {
  async getById(id: string): Promise<WithId<CommentDb> | null> {
    return commentsCollection.findOne({ _id: new ObjectId(id) });
  },
};
