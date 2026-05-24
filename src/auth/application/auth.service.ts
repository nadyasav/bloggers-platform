import { bcryptService } from '../../core/services/bcrypt.service';
import { Result, ResultStatus } from '../../core/types/result.types';
import { usersRepository } from '../../users/repositories/users.repository';

export const authService = {
  async login(loginOrEmail: string, password: string): Promise<Result> {
    const user = await usersRepository.getByLoginOrEmail(loginOrEmail);

    if (!user) {
      return { status: ResultStatus.Unauthorized, extensions: [], data: null };
    }

    const isPasswordValid = await bcryptService.compareHash(
      password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      return { status: ResultStatus.Unauthorized, extensions: [], data: null };
    }

    return { status: ResultStatus.Success, extensions: [], data: null };
  },
};
