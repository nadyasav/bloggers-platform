import { bcryptService } from '../../core/services/bcrypt.service';
import { Result, ResultStatus } from '../../core/types/result.types';
import { usersRepository } from '../../users/repositories/users.repository';
import { jwtService } from '../../core/services/jwt.service';
import { config } from '../../core/config';
import { SignOptions } from 'jsonwebtoken';
import { usersService } from '../../users/application/users.service';
import { v4 as uuidv4 } from 'uuid';
import { RegistrationInputDto } from '../dto/registration-input.dto';
import { nodemailerService } from '../../core/services/nodemailer.service';
import { emailTemplate } from '../../core/utils/email-template.util';
import { RegistrationConfirmationInputDto } from '../dto/registration-confirmation-input.dto';
import { EmailResendingInputDto } from '../dto/email-resending-input.dto';
import { authRepository } from '../repositories/auth.repository';
import { TokenWithPayload } from '../types/auth.types';
import { LoginInputDto } from '../dto/login-input.dto';
import { invalidTokensRepository } from '../repositories/invalid-tokens.repository';

export const authService = {
  async login(
    dto: LoginInputDto,
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
    const accessToken = jwtService.createToken(
      userId,
      config.accessTokenSecret,
      config.accessTokenExpiresIn as SignOptions['expiresIn'],
    );
    const refreshToken = jwtService.createToken(
      userId,
      config.refreshTokenSecret,
      config.refreshTokenExpiresIn as SignOptions['expiresIn'],
    );

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: { accessToken, refreshToken },
    };
  },

  async register(dto: RegistrationInputDto): Promise<Result<null>> {
    const expiresInMs = config.emailConfirmExpiresInMins * 60 * 1000;
    const emailConfirmation = {
      code: uuidv4(),
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
    const newCode = uuidv4();

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

  async verifyRefreshToken(token: string): Promise<Result<TokenWithPayload>> {
    const tokenPayload = jwtService.verifyToken(
      token,
      config.refreshTokenSecret,
    );

    if (!tokenPayload) {
      return { status: ResultStatus.Unauthorized, extensions: [], data: null };
    }

    const invalidToken = await invalidTokensRepository.findByToken(token);

    if (invalidToken) {
      return { status: ResultStatus.Unauthorized, extensions: [], data: null };
    }

    const tokenWithPayload = {
      token,
      userId: tokenPayload.userId,
      expiresAt: new Date(tokenPayload.exp * 1000),
    };

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: tokenWithPayload,
    };
  },

  async refreshToken(
    refreshToken: TokenWithPayload,
  ): Promise<Result<{ accessToken: string; refreshToken: string }>> {
    await invalidTokensRepository.addToken(
      refreshToken.token,
      refreshToken.expiresAt,
    );

    const accessToken = jwtService.createToken(
      refreshToken.userId,
      config.accessTokenSecret,
      config.accessTokenExpiresIn as SignOptions['expiresIn'],
    );
    const newRefreshToken = jwtService.createToken(
      refreshToken.userId,
      config.refreshTokenSecret,
      config.refreshTokenExpiresIn as SignOptions['expiresIn'],
    );

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: { accessToken, refreshToken: newRefreshToken },
    };
  },

  async logout(refreshToken: TokenWithPayload): Promise<Result<null>> {
    await invalidTokensRepository.addToken(
      refreshToken.token,
      refreshToken.expiresAt,
    );

    return { status: ResultStatus.Success, extensions: [], data: null };
  },
};
