import { WithId } from 'mongodb';
import { sessionsCollection } from '../../db/db';
import { DeviceSessionDb } from '../types/security.types';

export const securityRepository = {
  async createSession(session: DeviceSessionDb): Promise<void> {
    await sessionsCollection.insertOne(session);
  },

  async getSession(
    deviceId: string,
    issuedAt: Date,
  ): Promise<WithId<DeviceSessionDb> | null> {
    return sessionsCollection.findOne({ deviceId, issuedAt });
  },

  async updateSession(
    deviceId: string,
    issuedAt: Date,
    expiresAt: Date,
  ): Promise<void> {
    await sessionsCollection.updateOne(
      { deviceId },
      { $set: { issuedAt, expiresAt } },
    );
  },

  async deleteByDeviceId(deviceId: string): Promise<void> {
    await sessionsCollection.deleteOne({ deviceId });
  },
};
