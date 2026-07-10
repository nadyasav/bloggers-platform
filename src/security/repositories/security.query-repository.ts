import { WithId } from 'mongodb';
import { sessionsCollection } from '../../db/db';
import { DeviceSessionDb } from '../types/security.types';

export const securityQueryRepository = {
  async getDevicesByUserId(userId: string): Promise<WithId<DeviceSessionDb>[]> {
    return sessionsCollection.find({ userId }).toArray();
  },
};
