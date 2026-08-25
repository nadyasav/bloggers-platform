import { rateLimitCollection } from '../../db/db';
import { ApiRequestDb } from '../types/rate-limit.types';

export class RateLimitRepository {
  async createRequest(apiRequest: ApiRequestDb): Promise<void> {
    await rateLimitCollection.insertOne(apiRequest);
  }

  async getRequestsCount(
    ip: string,
    url: string,
    dateFrom: Date,
  ): Promise<number> {
    return rateLimitCollection.countDocuments({
      ip,
      url,
      date: { $gte: dateFrom },
    });
  }
}
