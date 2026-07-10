import { bcryptService } from '../../core/services/bcrypt.service';
import { Result, ResultStatus } from '../../core/types/result.types';
import { usersRepository } from '../../users/repositories/users.repository';
import { jwtService } from '../../core/services/jwt.service';
import { config } from '../../core/config';
import { SignOptions } from 'jsonwebtoken';
import { usersService } from '../../users/application/users.service';
import { randomUUID } from 'crypto';
import { RegistrationInputDto } from '../dto/registration-input.dto';
import { nodemailerService } from '../../core/services/nodemailer.service';
import { emailTemplate } from '../../core/utils/email-template.util';
import { RegistrationConfirmationInputDto } from '../dto/registration-confirmation-input.dto';
import { EmailResendingInputDto } from '../dto/email-resending-input.dto';
import { authRepository } from '../repositories/auth.repository';
import { RefreshTokenPayload } from '../types/auth.types';
import { LoginInputDto } from '../dto/login-input.dto';
import { securityRepository } from '../../security/repositories/security.repository';

export const authService = {
  async login(
    dto: LoginInputDto,
    deviceName: string,
    ip: string,
  ): Promise<Result<{ accessToken: string; refreshToken: string }>> {
    const user = await usersRepository.getByLoginOrEmail(dto.loginOrEmail);

    if (!user) {
      return { status: ResultStatus.Unauthorized, extensions: [], data: null };
    }

    const isPasswordValid = await bcryptService.compareHash(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      return { status: ResultStatus.Unauthorized, extensions: [], data: null };
    }

    if (!user.emailConfirmation.isConfirmed) {
      return { status: ResultStatus.Unauthorized, extensions: [], data: null };
    }

    const userId = user._id.toString();
    const deviceId = randomUUID();

    const { token: accessToken } = jwtService.createToken(
      { userId },
      config.accessTokenSecret,
      config.accessTokenExpiresIn as NonNullable<SignOptions['expiresIn']>,
    );
    const {
      token: refreshToken,
      iat,
      exp,
    } = jwtService.createToken(
      { userId, deviceId },
      config.refreshTokenSecret,
      config.refreshTokenExpiresIn as NonNullable<SignOptions['expiresIn']>,
    );

    await securityRepository.createSession({
      userId,
      deviceId,
      issuedAt: new Date(iat * 1000),
      expiresAt: new Date(exp * 1000),
      deviceName,
      ip,
    });

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: { accessToken, refreshToken },
    };
  },

  async register(dto: RegistrationInputDto): Promise<Result<null>> {
    const expiresInMs = config.emailConfirmExpiresInMins * 60 * 1000;
    const emailConfirmation = {
      code: randomUUID(),
      expiresAt: new Date(Date.now() + expiresInMs),
      isConfirmed: false,
    };

    const result = await usersService.create(dto, emailConfirmation);

    if (result.status !== ResultStatus.Success) {
      return result;
    }

    nodemailerService
      .sendEmail(dto.email, emailTemplate.registration(emailConfirmation.code))
      .catch((error) => {
        console.error(
          'Failed to send registration confirmation email: ',
          error,
        );
      });

    return { status: ResultStatus.Success, extensions: [], data: null };
  },

  async confirmRegistration(
    dto: RegistrationConfirmationInputDto,
  ): Promise<Result<null>> {
    const CODE_KEY = 'code';
    const user = await authRepository.getByConfirmationCode(dto.code);

    if (!user) {
      return {
        status: ResultStatus.BadRequest,
        extensions: [{ field: CODE_KEY, message: `${CODE_KEY} is incorrect` }],
        data: null,
      };
    }

    if (user.emailConfirmation.isConfirmed) {
      return {
        status: ResultStatus.BadRequest,
        extensions: [
          { field: CODE_KEY, message: `${CODE_KEY} has already been applied` },
        ],
        data: null,
      };
    }

    if (user.emailConfirmation.expiresAt < new Date()) {
      return {
        status: ResultStatus.BadRequest,
        extensions: [{ field: CODE_KEY, message: `${CODE_KEY} has expired` }],
        data: null,
      };
    }

    await authRepository.confirmEmail(user._id.toString());

    return { status: ResultStatus.Success, extensions: [], data: null };
  },

  async resendRegistrationEmail(
    dto: EmailResendingInputDto,
  ): Promise<Result<null>> {
    const EMAIL_KEY = 'email';
    const user = await usersRepository.getByEmail(dto.email);

    if (!user || user.emailConfirmation.isConfirmed) {
      return {
        status: ResultStatus.BadRequest,
        extensions: [
          {
            field: EMAIL_KEY,
            message: `${EMAIL_KEY} is incorrect or already confirmed`,
          },
        ],
        data: null,
      };
    }

    const expiresInMs = config.emailConfirmExpiresInMins * 60 * 1000;
    const newCode = randomUUID();

    await authRepository.updateEmailConfirmationCode(
      user._id.toString(),
      newCode,
      new Date(Date.now() + expiresInMs),
    );

    nodemailerService
      .sendEmail(dto.email, emailTemplate.registration(newCode))
      .catch((error) => {
        console.error(
          'Failed to resend registration confirmation email: ',
          error,
        );
      });

    return { status: ResultStatus.Success, extensions: [], data: null };
  },

  async verifyRefreshToken(
    token: string,
  ): Promise<Result<RefreshTokenPayload>> {
    const tokenPayload = jwtService.verifyToken(
      token,
      config.refreshTokenSecret,
    );

    if (!tokenPayload) {
      return { status: ResultStatus.Unauthorized, extensions: [], data: null };
    }

    const session = await securityRepository.getSession(
      tokenPayload.deviceId,
      new Date(tokenPayload.iat * 1000),
    );

    if (!session) {
      return { status: ResultStatus.Unauthorized, extensions: [], data: null };
    }

    const refreshTokenPayload = {
      userId: tokenPayload.userId,
      deviceId: tokenPayload.deviceId,
      iat: tokenPayload.iat,
      exp: tokenPayload.exp,
    };
    return {
      status: ResultStatus.Success,
      extensions: [],
      data: refreshTokenPayload,
    };
  },

  async refreshToken(
    refreshToken: RefreshTokenPayload,
  ): Promise<Result<{ accessToken: string; refreshToken: string }>> {
    const { token: accessToken } = jwtService.createToken(
      { userId: refreshToken.userId },
      config.accessTokenSecret,
      config.accessTokenExpiresIn as NonNullable<SignOptions['expiresIn']>,
    );
    const {
      token: newRefreshToken,
      iat,
      exp,
    } = jwtService.createToken(
      { userId: refreshToken.userId, deviceId: refreshToken.deviceId },
      config.refreshTokenSecret,
      config.refreshTokenExpiresIn as NonNullable<SignOptions['expiresIn']>,
    );

    await securityRepository.updateSession(
      refreshToken.deviceId,
      new Date(iat * 1000),
      new Date(exp * 1000),
    );

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: { accessToken, refreshToken: newRefreshToken },
    };
  },

  async logout(refreshToken: RefreshTokenPayload): Promise<Result<null>> {
    await securityRepository.deleteByDeviceId(refreshToken.deviceId);

    return { status: ResultStatus.Success, extensions: [], data: null };
  },
};
