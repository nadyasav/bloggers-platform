jest.mock('../../src/core/services/nodemailer.service', () => ({
  NodemailerService: class {
    sendEmail = jest.fn().mockResolvedValue(undefined);
  },
}));

import request from 'supertest';
import { randomUUID } from 'crypto';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../utils/test-setup-app';
import { connectToDb, client } from '../../src/db/db';
import { DeviceSession } from '../../src/security/types/security.types';
import {
  DEFAULT_USER,
  createConfirmedUser,
  login,
  getRefreshToken,
  refreshSession,
  clearDb,
  logout,
} from '../utils/auth-utils';
import {
  getDevices,
  deleteDevice,
  deleteOtherDevices,
  sortedDeviceIds,
} from '../utils/security-utils';

const USER_AGENTS = ['device-1', 'device-2', 'device-3', 'device-4'];

const OTHER_USER = {
  login: 'otheruser',
  password: 'password123',
  email: 'otheruser@test.com',
};

let mongoServer: MongoMemoryServer;

async function loginDevices(
  userAgents: string[] = USER_AGENTS,
): Promise<{ userAgent: string; refreshToken: string; deviceId: string }[]> {
  const devices: { userAgent: string; refreshToken: string }[] = [];

  for (const userAgent of userAgents) {
    const response = await login(
      DEFAULT_USER.login,
      DEFAULT_USER.password,
      userAgent,
    );

    expect(response.status).toBe(200);
    devices.push({ userAgent, refreshToken: getRefreshToken(response) });
  }

  const devicesResponse = await getDevices(devices[0].refreshToken);
  const sessions: DeviceSession[] = devicesResponse.body;

  return devices.map((device) => ({
    ...device,
    deviceId: sessions.find((session) => session.title === device.userAgent)!
      .deviceId,
  }));
}

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await connectToDb(mongoServer.getUri());
});

afterAll(async () => {
  await client.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await clearDb();
  await createConfirmedUser();
});

describe('GET /security/devices', () => {
  it('should return 200 and all active sessions of the current user', async () => {
    const devices = await loginDevices();

    const response = await getDevices(devices[0].refreshToken);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(USER_AGENTS.length);
    expect(sortedDeviceIds(response.body)).toEqual(sortedDeviceIds(devices));
    expect(response.body).toEqual(
      expect.arrayContaining(
        USER_AGENTS.map((userAgent) =>
          expect.objectContaining({
            ip: expect.any(String),
            title: userAgent,
            lastActiveDate: expect.any(String),
            deviceId: expect.any(String),
          }),
        ),
      ),
    );
  });

  it('should return the same list regardless of which device asks', async () => {
    const devices = await loginDevices();

    const device1Response = await getDevices(devices[0].refreshToken);
    const device3Response = await getDevices(devices[2].refreshToken);

    expect(sortedDeviceIds(device3Response.body)).toEqual(
      sortedDeviceIds(device1Response.body),
    );
  });

  it('should return only sessions of the current user', async () => {
    await createConfirmedUser(OTHER_USER);

    const ownRefreshToken = getRefreshToken(
      await login(DEFAULT_USER.login, DEFAULT_USER.password, USER_AGENTS[0]),
    );

    await login(OTHER_USER.login, OTHER_USER.password, USER_AGENTS[1]);

    const ownDevices = await getDevices(ownRefreshToken);

    expect(ownDevices.status).toBe(200);
    expect(ownDevices.body).toHaveLength(1);
    expect(ownDevices.body[0].title).toBe(USER_AGENTS[0]);
  });

  it('should return 401 without a refresh token cookie', async () => {
    const response = await request(app).get('/security/devices');

    expect(response.status).toBe(401);
  });

  it('should return 401 for an invalid refresh token', async () => {
    const response = await getDevices('invalid.refresh.token');

    expect(response.status).toBe(401);
  });
});

describe('DELETE /security/devices/:deviceId', () => {
  it('should return 204 and remove the device from the list', async () => {
    const devices = await loginDevices();

    const response = await deleteDevice(
      devices[0].refreshToken,
      devices[1].deviceId,
    );

    expect(response.status).toBe(204);

    const devicesResponse = await getDevices(devices[0].refreshToken);

    expect(devicesResponse.body).toHaveLength(USER_AGENTS.length - 1);
    expect(sortedDeviceIds(devicesResponse.body)).not.toContain(
      devices[1].deviceId,
    );
  });

  it('should invalidate the refresh token of the deleted device', async () => {
    const devices = await loginDevices();

    await deleteDevice(devices[0].refreshToken, devices[1].deviceId);

    const devicesResponse = await getDevices(devices[1].refreshToken);
    const refreshSessionResponse = await refreshSession(
      devices[1].refreshToken,
    );

    expect(devicesResponse.status).toBe(401);
    expect(refreshSessionResponse.status).toBe(401);
  });

  it('should allow a device to delete itself', async () => {
    const devices = await loginDevices();

    const response = await deleteDevice(
      devices[0].refreshToken,
      devices[0].deviceId,
    );

    expect(response.status).toBe(204);

    const deletedDeviceResponse = await getDevices(devices[0].refreshToken);

    expect(deletedDeviceResponse.status).toBe(401);

    const devicesResponse = await getDevices(devices[1].refreshToken);

    expect(devicesResponse.body).toHaveLength(USER_AGENTS.length - 1);
    expect(sortedDeviceIds(devicesResponse.body)).not.toContain(
      devices[0].deviceId,
    );
  });

  it('should allow the only device to delete itself', async () => {
    const devices = await loginDevices([USER_AGENTS[0]]);

    const response = await deleteDevice(
      devices[0].refreshToken,
      devices[0].deviceId,
    );

    expect(response.status).toBe(204);

    const deletedDeviceResponse = await getDevices(devices[0].refreshToken);

    expect(deletedDeviceResponse.status).toBe(401);
  });

  it('should return 401 without a refresh token cookie', async () => {
    const devices = await loginDevices([USER_AGENTS[0]]);

    const response = await request(app).delete(
      `/security/devices/${devices[0].deviceId}`,
    );

    expect(response.status).toBe(401);
  });

  it('should return 401 for an invalid refresh token', async () => {
    const devices = await loginDevices([USER_AGENTS[0]]);

    const response = await deleteDevice(
      'invalid.refresh.token',
      devices[0].deviceId,
    );

    expect(response.status).toBe(401);
  });

  it('should return 404 for a non-existing deviceId', async () => {
    const devices = await loginDevices([USER_AGENTS[0]]);

    const response = await deleteDevice(devices[0].refreshToken, randomUUID());

    expect(response.status).toBe(404);
  });

  it('should return 403 when deleting a device of another user', async () => {
    await createConfirmedUser(OTHER_USER);

    const ownRefreshToken = getRefreshToken(
      await login(DEFAULT_USER.login, DEFAULT_USER.password, USER_AGENTS[0]),
    );
    const otherRefreshToken = getRefreshToken(
      await login(OTHER_USER.login, OTHER_USER.password, USER_AGENTS[1]),
    );

    const otherDevices = await getDevices(otherRefreshToken);
    const otherDeviceId = otherDevices.body[0].deviceId;

    const response = await deleteDevice(ownRefreshToken, otherDeviceId);

    expect(response.status).toBe(403);

    const otherDevicesAfterAttempt = await getDevices(otherRefreshToken);

    expect(otherDevicesAfterAttempt.status).toBe(200);
    expect(otherDevicesAfterAttempt.body).toHaveLength(1);
    expect(otherDevicesAfterAttempt.body[0].deviceId).toBe(otherDeviceId);
  });
});

describe('DELETE /security/devices', () => {
  it('should return 204 and keep only the current device', async () => {
    const devices = await loginDevices();

    const response = await deleteOtherDevices(devices[0].refreshToken);

    expect(response.status).toBe(204);

    const devicesResponse = await getDevices(devices[0].refreshToken);

    expect(devicesResponse.body).toHaveLength(1);
    expect(devicesResponse.body[0].deviceId).toBe(devices[0].deviceId);
  });

  it('should invalidate the refresh tokens of all other devices', async () => {
    const [currentDevice, ...otherDevices] = await loginDevices();

    await deleteOtherDevices(currentDevice.refreshToken);

    for (const device of otherDevices) {
      const response = await getDevices(device.refreshToken);

      expect(response.status).toBe(401);
    }

    const currentDeviceResponse = await getDevices(currentDevice.refreshToken);

    expect(currentDeviceResponse.status).toBe(200);
  });

  it('should return 204 when the current device is the only one', async () => {
    const devices = await loginDevices([USER_AGENTS[0]]);

    const response = await deleteOtherDevices(devices[0].refreshToken);

    expect(response.status).toBe(204);

    const devicesResponse = await getDevices(devices[0].refreshToken);

    expect(devicesResponse.body).toHaveLength(1);
  });

  it('should not delete sessions of other users', async () => {
    await createConfirmedUser(OTHER_USER);

    const ownRefreshToken = getRefreshToken(
      await login(DEFAULT_USER.login, DEFAULT_USER.password, USER_AGENTS[0]),
    );
    const otherRefreshToken = getRefreshToken(
      await login(OTHER_USER.login, OTHER_USER.password, USER_AGENTS[1]),
    );

    const otherDevices = await getDevices(otherRefreshToken);
    const otherDeviceId = otherDevices.body[0].deviceId;

    const response = await deleteOtherDevices(ownRefreshToken);

    expect(response.status).toBe(204);

    const otherDevicesAfterDelete = await getDevices(otherRefreshToken);

    expect(otherDevicesAfterDelete.status).toBe(200);
    expect(otherDevicesAfterDelete.body).toHaveLength(1);
    expect(otherDevicesAfterDelete.body[0].deviceId).toBe(otherDeviceId);
  });

  it('should return 401 without a refresh token cookie', async () => {
    const response = await request(app).delete('/security/devices');

    expect(response.status).toBe(401);
  });

  it('should return 401 for an invalid refresh token', async () => {
    const response = await deleteOtherDevices('invalid.refresh.token');

    expect(response.status).toBe(401);
  });
});

describe('device sessions scenario', () => {
  it('should keep devices in sync through refresh, delete, logout and delete-all', async () => {
    const loggedDevices = await loginDevices();

    const devicesBeforeRefresh = await getDevices(
      loggedDevices[0].refreshToken,
    );

    expect(devicesBeforeRefresh.status).toBe(200);
    expect(devicesBeforeRefresh.body).toHaveLength(USER_AGENTS.length);

    const refreshResponse = await refreshSession(loggedDevices[0].refreshToken);

    expect(refreshResponse.status).toBe(200);

    const rotatedToken = getRefreshToken(refreshResponse);
    const devicesAfterRefresh = await getDevices(rotatedToken);

    expect(devicesAfterRefresh.status).toBe(200);
    expect(devicesAfterRefresh.body).toHaveLength(USER_AGENTS.length);
    expect(sortedDeviceIds(devicesAfterRefresh.body)).toEqual(
      sortedDeviceIds(devicesBeforeRefresh.body),
    );

    const device1Before: DeviceSession = devicesBeforeRefresh.body.find(
      (device: DeviceSession) => device.deviceId === loggedDevices[0].deviceId,
    );
    const device1After: DeviceSession = devicesAfterRefresh.body.find(
      (device: DeviceSession) => device.deviceId === loggedDevices[0].deviceId,
    );

    expect(new Date(device1After.lastActiveDate).getTime()).toBeGreaterThan(
      new Date(device1Before.lastActiveDate).getTime(),
    );

    const notRefreshedLoggedDevices = loggedDevices.slice(1);

    for (const notRefreshedLoggedDevice of notRefreshedLoggedDevices) {
      const sessionBefore = devicesBeforeRefresh.body.find(
        (device: DeviceSession) =>
          device.deviceId === notRefreshedLoggedDevice.deviceId,
      );
      const sessionAfter = devicesAfterRefresh.body.find(
        (device: DeviceSession) =>
          device.deviceId === notRefreshedLoggedDevice.deviceId,
      );

      expect(sessionAfter.lastActiveDate).toBe(sessionBefore.lastActiveDate);
    }

    const deleteResponse = await deleteDevice(
      rotatedToken,
      loggedDevices[1].deviceId,
    );

    expect(deleteResponse.status).toBe(204);

    const devicesAfterDelete = await getDevices(rotatedToken);

    expect(devicesAfterDelete.status).toBe(200);
    expect(devicesAfterDelete.body).toHaveLength(USER_AGENTS.length - 1);
    expect(sortedDeviceIds(devicesAfterDelete.body)).not.toContain(
      loggedDevices[1].deviceId,
    );

    const logoutResponse = await logout(loggedDevices[2].refreshToken);

    expect(logoutResponse.status).toBe(204);

    const devicesAfterLogout = await getDevices(rotatedToken);

    expect(devicesAfterLogout.status).toBe(200);
    expect(devicesAfterLogout.body).toHaveLength(USER_AGENTS.length - 2);
    expect(sortedDeviceIds(devicesAfterLogout.body)).not.toContain(
      loggedDevices[2].deviceId,
    );
    expect(sortedDeviceIds(devicesAfterLogout.body)).toEqual(
      [loggedDevices[0].deviceId, loggedDevices[3].deviceId].sort(),
    );

    const deleteOtherResponse = await deleteOtherDevices(rotatedToken);

    expect(deleteOtherResponse.status).toBe(204);

    const devicesAfterDeleteOther = await getDevices(rotatedToken);

    expect(devicesAfterDeleteOther.status).toBe(200);
    expect(devicesAfterDeleteOther.body).toHaveLength(1);
    expect(devicesAfterDeleteOther.body[0].deviceId).toBe(
      loggedDevices[0].deviceId,
    );
  });
});
