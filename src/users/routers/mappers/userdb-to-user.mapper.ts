import { WithId } from 'mongodb';
import { User, UserDb } from '../../types/user.types';

export function mapUserDbToUser(userDb: WithId<UserDb>): User {
  return {
    id: userDb._id.toString(),
    login: userDb.login,
    email: userDb.email,
    createdAt: userDb.createdAt,
  };
}
