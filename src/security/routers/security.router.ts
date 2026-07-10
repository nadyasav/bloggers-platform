import { Router } from 'express';
import { refreshTokenAuthMiddleware } from '../../auth/middlewares/refresh-token-auth.middleware';
import { getDevicesHandler } from './handlers/get-devices.handler';
import { deleteOtherDevicesHandler } from './handlers/delete-other-devices.handler';
import { deleteDeviceHandler } from './handlers/delete-device.handler';

export const securityRouter = Router();

securityRouter
  .get('/devices', refreshTokenAuthMiddleware, getDevicesHandler)
  .delete('/devices', refreshTokenAuthMiddleware, deleteOtherDevicesHandler)
  .delete(
    '/devices/:deviceId',
    refreshTokenAuthMiddleware,
    deleteDeviceHandler,
  );
