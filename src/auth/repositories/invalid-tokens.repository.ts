import { WithId } from 'mongodb';
import { invalidTokensCollection } from '../../db/db';
import { InvalidTokenDb } from '../types/auth.types';

export const invalidTokensRepository = {
  async addToken(token: string, expiresAt: Date): Promise<void> {
    await invalidTokensCollection.insertOne({ token, expiresAt });
  },

  async findByToken(token: string): Promise<WithId<InvalidTokenDb> | null> {
    return invalidTokensCollection.findOne({ token });
  },
};
