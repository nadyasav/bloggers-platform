import { bcryptService } from '../../core/services/bcrypt.service';
import { Result, ResultStatus } from '../../core/types/result.types';
import { usersRepository } from '../../users/repositories/users.repository';
import { jwtService } from '../../core/services/jwt.service';
import { config } from '../../core/config';
import { SignOptions } from 'jsonwebtoken';

export const authService = {
  async login(
    loginOrEmail: string,
    password: string,
  ): Promise<Result<string | null>> {
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

    const accessToken = jwtService.createToken(
      user._id.toString(),
      config.accessTokenSecret,
      config.accessTokenExpiresIn as SignOptions['expiresIn'],
    );

    return { status: ResultStatus.Success, extensions: [], data: accessToken };
  },
};
