import { Request, Response } from 'express';
import { securityQueryRepository } from '../../repositories/security.query-repository';
import { mapDeviceSessionDbToDeviceSession } from '../mappers/devicesessiondb-to-devicesession.mapper';

export async function getDevicesHandler(req: Request, res: Response) {
  const sessions = await securityQueryRepository.getDevicesByUserId(
    req.refreshTokenPayload!.userId,
  );

  res.status(200).send(sessions.map(mapDeviceSessionDbToDeviceSession));
}
