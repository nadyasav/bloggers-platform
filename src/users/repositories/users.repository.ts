import { ObjectId, WithId } from 'mongodb';
import { usersCollection } from '../../db/db';
import { UserDb } from '../types/user.types';
import { UserInputDto } from '../dto/user-input.dto';
import { UserNotFoundError } from '../errors/user-not-found.error';

export const usersRepository = {
  async getByLogin(login: string): Promise<WithId<UserDb> | null> {
    return usersCollection.findOne({ login });
  },

  async getByEmail(email: string): Promise<WithId<UserDb> | null> {
    return usersCollection.findOne({ email });
  },

  async create(dto: UserInputDto, passwordHash: string): Promise<string> {
    const newUser: UserDb = {
      login: dto.login,
      email: dto.email,
      passwordHash,
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);
    return result.insertedId.toString();
  },

  async delete(id: string): Promise<void> {
    const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      throw new UserNotFoundError();
    }
  },
};
