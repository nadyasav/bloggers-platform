import { Request, Response } from 'express';
import { securityService } from '../../application/security.service';

export async function deleteOtherDevicesHandler(req: Request, res: Response) {
  await securityService.deleteOtherSessions(
    req.refreshTokenPayload!.userId,
    req.refreshTokenPayload!.deviceId,
  );

  res.sendStatus(204);
}
