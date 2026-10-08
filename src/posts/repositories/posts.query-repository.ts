import { ObjectId, WithId } from 'mongodb';
import { injectable } from 'inversify';
import { PostDb } from '../types/post.types';
import { postsCollection } from '../../db/db';

@injectable()
export class PostsQueryRepository {
  async getById(id: string): Promise<WithId<PostDb> | null> {
    return postsCollection.findOne({ _id: new ObjectId(id) });
  }
}
