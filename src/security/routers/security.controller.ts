import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { SecurityService } from '../application/security.service';
import { SecurityQueryRepository } from '../repositories/security.query-repository';
import { ResultStatus } from '../../core/types/result.types';
import { resultToErrorResponse } from '../../core/utils/result-status.util';
import { mapDeviceSessionDbToDeviceSession } from './mappers/devicesessiondb-to-devicesession.mapper';

@injectable()
export class SecurityController {
  private securityService: SecurityService;
  private securityQueryRepository: SecurityQueryRepository;

  constructor(
    @inject(SecurityService) securityService: SecurityService,
    @inject(SecurityQueryRepository)
    securityQueryRepository: SecurityQueryRepository,
  ) {
    this.securityService = securityService;
    this.securityQueryRepository = securityQueryRepository;
  }

  async getDevicesHandler(req: Request, res: Response) {
    const sessions = await this.securityQueryRepository.getDevicesByUserId(
      req.refreshTokenPayload!.userId,
    );

    res.status(200).send(sessions.map(mapDeviceSessionDbToDeviceSession));
  }

  async deleteOtherDevicesHandler(req: Request, res: Response) {
    await this.securityService.deleteOtherSessions(
      req.refreshTokenPayload!.userId,
      req.refreshTokenPayload!.deviceId,
    );

    res.sendStatus(204);
  }

  async deleteDeviceHandler(req: Request<{ deviceId: string }>, res: Response) {
    const result = await this.securityService.deleteSession(
      req.refreshTokenPayload!.userId,
      req.params.deviceId,
    );

    if (result.status !== ResultStatus.Success) {
      const error = resultToErrorResponse(result);
      return res.status(error.code).send(error.body);
    }

    res.sendStatus(204);
  }
}
