import { injectable } from 'inversify';
import { LikeModel } from '../domain/like.entity';
import { LikeStatus } from '../types/like.types';
import { ClientSession } from 'mongodb';

@injectable()
export class LikesRepository {
  async updateAndGetPrevStatus(
    parentId: string,
    authorId: string,
    status: LikeStatus,
    session?: ClientSession,
  ): Promise<LikeStatus> {
    const prevLike = await LikeModel.findOneAndUpdate(
      { parentId, authorId },
      { $set: { status }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true, returnDocument: 'before', session },
    ).lean();

    return prevLike?.status ?? LikeStatus.None;
  }
}
