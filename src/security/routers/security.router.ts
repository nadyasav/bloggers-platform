import { Router } from 'express';
import {
  securityController,
  refreshTokenAuthMiddleware,
} from '../../composition-root';

export const securityRouter = Router();

securityRouter
  .get(
    '/devices',
    refreshTokenAuthMiddleware.handle.bind(refreshTokenAuthMiddleware),
    securityController.getDevicesHandler.bind(securityController),
  )
  .delete(
    '/devices',
    refreshTokenAuthMiddleware.handle.bind(refreshTokenAuthMiddleware),
    securityController.deleteOtherDevicesHandler.bind(securityController),
  )
  .delete(
    '/devices/:deviceId',
    refreshTokenAuthMiddleware.handle.bind(refreshTokenAuthMiddleware),
    securityController.deleteDeviceHandler.bind(securityController),
  );
