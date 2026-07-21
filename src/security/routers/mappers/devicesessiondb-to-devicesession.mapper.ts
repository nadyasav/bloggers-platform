import { WithId } from 'mongodb';
import { DeviceSession, DeviceSessionDb } from '../../types/security.types';

export const mapDeviceSessionDbToDeviceSession = (
  session: WithId<DeviceSessionDb>,
): DeviceSession => ({
  ip: session.ip,
  title: session.deviceName,
  lastActiveDate: session.lastActiveDate.toISOString(),
  deviceId: session.deviceId,
});
