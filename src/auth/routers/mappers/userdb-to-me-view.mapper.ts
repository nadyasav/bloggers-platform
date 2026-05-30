import { WithId } from 'mongodb';
import { UserDb } from '../../../users/types/user.types';

export function mapUserDbToMeView(userDb: WithId<UserDb>) {
  return {
    userId: userDb._id.toString(),
    login: userDb.login,
    email: userDb.email,
  };
}
