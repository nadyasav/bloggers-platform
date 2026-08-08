import { Result, ResultStatus } from '../../core/types/result.types';
import { securityRepository } from '../repositories/security.repository';

export const securityService = {
  async deleteOtherSessions(
    userId: string,
    currentDeviceId: string,
  ): Promise<Result<null>> {
    await securityRepository.deleteOtherSessions(userId, currentDeviceId);

    return { status: ResultStatus.Success, extensions: [], data: null };
  },

  async deleteSession(userId: string, deviceId: string): Promise<Result<null>> {
    const session = await securityRepository.getByDeviceId(deviceId);

    if (!session) {
      return { status: ResultStatus.NotFound, extensions: [], data: null };
    }

    if (session.userId !== userId) {
      return { status: ResultStatus.Forbidden, extensions: [], data: null };
    }

    await securityRepository.deleteByDeviceId(deviceId);

    return { status: ResultStatus.Success, extensions: [], data: null };
  },
};
