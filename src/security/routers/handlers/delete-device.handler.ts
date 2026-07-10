import { Request, Response } from 'express';
import { securityService } from '../../application/security.service';
import { ResultStatus } from '../../../core/types/result.types';
import { resultToErrorResponse } from '../../../core/utils/result-status.util';

export async function deleteDeviceHandler(
  req: Request<{ deviceId: string }>,
  res: Response,
) {
  const result = await securityService.deleteSession(
    req.refreshTokenPayload!.userId,
    req.params.deviceId,
  );

  if (result.status !== ResultStatus.Success) {
    const error = resultToErrorResponse(result);
    return res.status(error.code).send(error.body);
  }

  res.sendStatus(204);
}
