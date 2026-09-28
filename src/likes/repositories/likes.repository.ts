import { injectable } from 'inversify';
import { LikeModel } from '../domain/like.entity';
import { LikesCounters, LikeStatus } from '../types/like.types';
import { ClientSession } from 'mongodb';

@injectable()
export class LikesRepository {
  async updateStatus(
    parentId: string,
    authorId: string,
    status: LikeStatus,
    session?: ClientSession,
  ): Promise<void> {
    await LikeModel.updateOne(
      { parentId, authorId },
      { $set: { status }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true, session },
    );
  }

  async getCounters(
    parentId: string,
    session?: ClientSession,
  ): Promise<LikesCounters> {
    const [likesCount, dislikesCount] = await Promise.all([
      LikeModel.countDocuments(
        { parentId, status: LikeStatus.Like },
        { session },
      ),
      LikeModel.countDocuments(
        { parentId, status: LikeStatus.Dislike },
        { session },
      ),
    ]);

    return { likesCount, dislikesCount };
  }
}
