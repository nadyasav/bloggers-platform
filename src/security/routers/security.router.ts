import { Router } from 'express';
import { container } from '../../composition-root';
import { SecurityController } from './security.controller';
import { RefreshTokenAuthMiddleware } from '../../auth/middlewares/refresh-token-auth.middleware';

const securityController = container.get(SecurityController);
const refreshTokenAuthMiddleware = container.get(RefreshTokenAuthMiddleware);

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
