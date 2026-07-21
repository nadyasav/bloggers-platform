import { WithId } from 'mongodb';
import { sessionsCollection } from '../../db/db';
import { DeviceSessionDb } from '../types/security.types';

export const securityRepository = {
  async createSession(session: DeviceSessionDb): Promise<void> {
    await sessionsCollection.insertOne(session);
  },

  async getSession(
    deviceId: string,
    lastTokenId: string,
  ): Promise<WithId<DeviceSessionDb> | null> {
    return sessionsCollection.findOne({ deviceId, lastTokenId });
  },

  async getByDeviceId(
    deviceId: string,
  ): Promise<WithId<DeviceSessionDb> | null> {
    return sessionsCollection.findOne({ deviceId });
  },

  async updateSession(
    deviceId: string,
    lastTokenId: string,
    lastActiveDate: Date,
    expiresAt: Date,
  ): Promise<void> {
    await sessionsCollection.updateOne(
      { deviceId },
      { $set: { lastTokenId, lastActiveDate, expiresAt } },
    );
  },

  async deleteByDeviceId(deviceId: string): Promise<void> {
    await sessionsCollection.deleteOne({ deviceId });
  },

  async deleteOtherSessions(
    userId: string,
    currentDeviceId: string,
  ): Promise<void> {
    await sessionsCollection.deleteMany({
      userId,
      deviceId: { $ne: currentDeviceId },
    });
  },
};
