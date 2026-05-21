import { ObjectId, WithId } from 'mongodb';
import { UserDb } from '../types/user.types';
import { usersCollection } from '../../db/db';

export const usersQueryRepository = {
  async getById(id: string): Promise<WithId<UserDb> | null> {
    return usersCollection.findOne({ _id: new ObjectId(id) });
  },
};
