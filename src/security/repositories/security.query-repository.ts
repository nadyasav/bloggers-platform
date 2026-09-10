import { WithId } from 'mongodb';
import { injectable } from 'inversify';
import { sessionsCollection } from '../../db/db';
import { DeviceSessionDb } from '../types/security.types';

@injectable()
export class SecurityQueryRepository {
  async getDevicesByUserId(userId: string): Promise<WithId<DeviceSessionDb>[]> {
    return sessionsCollection.find({ userId }).toArray();
  }
}
