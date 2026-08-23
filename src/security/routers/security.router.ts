import { Router } from 'express';
import { refreshTokenAuthMiddleware } from '../../auth/middlewares/refresh-token-auth.middleware';
import { securityController } from '../../composition-root';

export const securityRouter = Router();

securityRouter
  .get(
    '/devices',
    refreshTokenAuthMiddleware,
    securityController.getDevicesHandler.bind(securityController),
  )
  .delete(
    '/devices',
    refreshTokenAuthMiddleware,
    securityController.deleteOtherDevicesHandler.bind(securityController),
  )
  .delete(
    '/devices/:deviceId',
    refreshTokenAuthMiddleware,
    securityController.deleteDeviceHandler.bind(securityController),
  );
