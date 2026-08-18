import { ObjectId, WithId } from 'mongodb';
import { UserDb } from '../../users/types/user.types';
import { usersCollection } from '../../db/db';

export const authRepository = {
  async getByConfirmationCode(code: string): Promise<WithId<UserDb> | null> {
    return usersCollection.findOne({ 'emailConfirmation.code': code });
  },

  async confirmEmail(id: string): Promise<void> {
    await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { 'emailConfirmation.isConfirmed': true } },
    );
  },

  async updateEmailConfirmationCode(
    id: string,
    code: string,
    expiresAt: Date,
  ): Promise<void> {
    await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          'emailConfirmation.code': code,
          'emailConfirmation.expiresAt': expiresAt,
        },
      },
    );
  },

  async getByPasswordRecoveryCode(
    code: string,
  ): Promise<WithId<UserDb> | null> {
    return usersCollection.findOne({ 'passwordRecovery.code': code });
  },

  async updatePasswordRecoveryCode(
    id: string,
    code: string,
    expiresAt: Date,
  ): Promise<void> {
    await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { passwordRecovery: { code, expiresAt } } },
    );
  },

  async setNewPassword(id: string, passwordHash: string): Promise<void> {
    await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { passwordHash }, $unset: { passwordRecovery: '' } },
    );
  },
};
