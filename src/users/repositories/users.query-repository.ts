import { ObjectId, WithId } from 'mongodb';
import { injectable } from 'inversify';
import { UserDb } from '../types/user.types';
import { usersCollection } from '../../db/db';
import { UserQueryDto } from '../dto/user-query.dto';

@injectable()
export class UsersQueryRepository {
  async getAll(
    query: UserQueryDto,
  ): Promise<{ users: WithId<UserDb>[]; totalCount: number }> {
    const searchConditions = [];

    if (query.searchLoginTerm) {
      searchConditions.push({
        login: { $regex: query.searchLoginTerm, $options: 'i' },
      });
    }

    if (query.searchEmailTerm) {
      searchConditions.push({
        email: { $regex: query.searchEmailTerm, $options: 'i' },
      });
    }

    const searchFilter = searchConditions.length
      ? { $or: searchConditions }
      : {};

    const skipCount = (query.pageNumber - 1) * query.pageSize;
    const totalCount = await usersCollection.countDocuments(searchFilter);
    const users = await usersCollection
      .find(searchFilter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(skipCount)
      .limit(query.pageSize)
      .toArray();

    return { users, totalCount };
  }

  async getById(id: string): Promise<WithId<UserDb> | null> {
    return usersCollection.findOne({ _id: new ObjectId(id) });
  }
}
