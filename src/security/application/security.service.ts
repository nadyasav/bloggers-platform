import { Result, ResultStatus } from '../../core/types/result.types';
import { SecurityRepository } from '../repositories/security.repository';

export class SecurityService {
  private securityRepository: SecurityRepository;

  constructor(securityRepository: SecurityRepository) {
    this.securityRepository = securityRepository;
  }

  async deleteOtherSessions(
    userId: string,
    currentDeviceId: string,
  ): Promise<Result<null>> {
    await this.securityRepository.deleteOtherSessions(userId, currentDeviceId);

    return { status: ResultStatus.Success, extensions: [], data: null };
  }

  async deleteSession(userId: string, deviceId: string): Promise<Result<null>> {
    const session = await this.securityRepository.getByDeviceId(deviceId);

    if (!session) {
      return { status: ResultStatus.NotFound, extensions: [], data: null };
    }

    if (session.userId !== userId) {
      return { status: ResultStatus.Forbidden, extensions: [], data: null };
    }

    await this.securityRepository.deleteByDeviceId(deviceId);

    return { status: ResultStatus.Success, extensions: [], data: null };
  }
}
