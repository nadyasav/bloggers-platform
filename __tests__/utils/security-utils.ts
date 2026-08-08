import request from 'supertest';
import { app } from './test-setup-app';
import { REFRESH_TOKEN_COOKIE } from '../../src/auth/auth.constants';

export function getDevices(refreshToken: string) {
  return request(app)
    .get('/security/devices')
    .set('Cookie', `${REFRESH_TOKEN_COOKIE}=${refreshToken}`);
}

export function deleteDevice(refreshToken: string, deviceId: string) {
  return request(app)
    .delete(`/security/devices/${deviceId}`)
    .set('Cookie', `${REFRESH_TOKEN_COOKIE}=${refreshToken}`);
}

export function deleteOtherDevices(refreshToken: string) {
  return request(app)
    .delete('/security/devices')
    .set('Cookie', `${REFRESH_TOKEN_COOKIE}=${refreshToken}`);
}

export function sortedDeviceIds(devices: { deviceId: string }[]): string[] {
  return devices.map((device) => device.deviceId).sort();
}
