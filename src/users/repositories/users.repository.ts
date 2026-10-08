import { MongoServerError, ObjectId, WithId } from 'mongodb';
import { injectable } from 'inversify';
import { usersCollection } from '../../db/db';
import { UserDb } from '../types/user.types';
import { UserNotFoundError } from '../errors/user-not-found.error';
import { UserAlreadyExistsError } from '../errors/user-already-exists.error';

const DUPLICATE_KEY_ERROR_CODE = 11000;

@injectable()
export class UsersRepository {
  async getByLogin(login: string): Promise<WithId<UserDb> | null> {
    return usersCollection.findOne({ login });
  }

  async getByEmail(email: string): Promise<WithId<UserDb> | null> {
    return usersCollection.findOne({ email });
  }

  async getByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<WithId<UserDb> | null> {
    return usersCollection.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
  }

  async getById(id: string): Promise<WithId<UserDb> | null> {
    return usersCollection.findOne({ _id: new ObjectId(id) });
  }

  async create(user: UserDb): Promise<string> {
    try {
      const result = await usersCollection.insertOne(user);
      return result.insertedId.toString();
    } catch (error) {
      const isDuplicateError =
        error instanceof MongoServerError &&
        error.code === DUPLICATE_KEY_ERROR_CODE;

      if (isDuplicateError) {
        const keyPatternFields = Object.keys(error.keyPattern ?? {});
        const duplicateField = keyPatternFields[0] ?? 'login or email';

        throw new UserAlreadyExistsError(duplicateField);
      }

      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      throw new UserNotFoundError();
    }
  }
}
