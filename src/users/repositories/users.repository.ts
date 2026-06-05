import { ObjectId, WithId } from 'mongodb';
import { usersCollection } from '../../db/db';
import { UserDb } from '../types/user.types';
import { UserNotFoundError } from '../errors/user-not-found.error';

export const usersRepository = {
  async getByLogin(login: string): Promise<WithId<UserDb> | null> {
    return usersCollection.findOne({ login });
  },

  async getByEmail(email: string): Promise<WithId<UserDb> | null> {
    return usersCollection.findOne({ email });
  },

  async getByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<WithId<UserDb> | null> {
    return usersCollection.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
  },

  async getById(id: string): Promise<WithId<UserDb> | null> {
    return usersCollection.findOne({ _id: new ObjectId(id) });
  },

  async create(user: UserDb): Promise<string> {
    const result = await usersCollection.insertOne(user);
    return result.insertedId.toString();
  },

  async getByConfirmationCode(code: string): Promise<WithId<UserDb> | null> {
    return usersCollection.findOne({ 'emailConfirmation.code': code });
  },

  async confirmEmail(id: string): Promise<void> {
    await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { 'emailConfirmation.isConfirmed': true } },
    );
  },

  async delete(id: string): Promise<void> {
    const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      throw new UserNotFoundError();
    }
  },
};
