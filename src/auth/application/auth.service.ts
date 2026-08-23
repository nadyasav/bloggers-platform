import { bcryptService } from '../../core/services/bcrypt.service';
import { Result, ResultStatus } from '../../core/types/result.types';
import { UsersRepository } from '../../users/repositories/users.repository';
import { jwtService } from '../../core/services/jwt.service';
import { config } from '../../core/config';
import { SignOptions } from 'jsonwebtoken';
import { UsersService } from '../../users/application/users.service';
import { randomUUID } from 'crypto';
import { RegistrationInputDto } from '../dto/registration-input.dto';
import { nodemailerService } from '../../core/services/nodemailer.service';
import { emailTemplate } from '../../core/utils/email-template.util';
import { RegistrationConfirmationInputDto } from '../dto/registration-confirmation-input.dto';
import { EmailResendingInputDto } from '../dto/email-resending-input.dto';
import { AuthRepository } from '../repositories/auth.repository';
import { RefreshTokenPayload } from '../types/auth.types';
import { LoginInputDto } from '../dto/login-input.dto';
import { SecurityRepository } from '../../security/repositories/security.repository';
import { PasswordRecoveryInputDto } from '../dto/password-recovery-input.dto';
import { NewPasswordInputDto } from '../dto/new-password-input.dto';

export class AuthService {
  private usersRepository: UsersRepository;
  private usersService: UsersService;
  private authRepository: AuthRepository;
  private securityRepository: SecurityRepository;

  constructor(
    usersRepository: UsersRepository,
    usersService: UsersService,
    authRepository: AuthRepository,
    securityRepository: SecurityRepository,
  ) {
    this.usersRepository = usersRepository;
    this.usersService = usersService;
    this.authRepository = authRepository;
    this.securityRepository = securityRepository;
  }

  async login(
    dto: LoginInputDto,
    deviceName: string,
    ip: string,
  ): Promise<Result<{ accessToken: string; refreshToken: string }>> {
    const user = await this.usersRepository.getByLoginOrEmail(dto.loginOrEmail);

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
    const jti = randomUUID();

    const { token: accessToken } = jwtService.createToken(
      { userId },
      config.accessTokenSecret,
      config.accessTokenExpiresIn as NonNullable<SignOptions['expiresIn']>,
    );
    const { token: refreshToken, exp } = jwtService.createToken(
      { userId, deviceId, jti },
      config.refreshTokenSecret,
      config.refreshTokenExpiresIn as NonNullable<SignOptions['expiresIn']>,
    );

    await this.securityRepository.createSession({
      userId,
      deviceId,
      lastTokenId: jti,
      lastActiveDate: new Date(),
      expiresAt: new Date(exp * 1000),
      deviceName,
      ip,
    });

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: { accessToken, refreshToken },
    };
  }

  async register(dto: RegistrationInputDto): Promise<Result<null>> {
    const expiresInMs = config.emailConfirmExpiresInMins * 60 * 1000;
    const emailConfirmation = {
      code: randomUUID(),
      expiresAt: new Date(Date.now() + expiresInMs),
      isConfirmed: false,
    };

    const result = await this.usersService.create(dto, emailConfirmation);

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
  }

  async confirmRegistration(
    dto: RegistrationConfirmationInputDto,
  ): Promise<Result<null>> {
    const CODE_KEY = 'code';
    const user = await this.authRepository.getByConfirmationCode(dto.code);

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

    await this.authRepository.confirmEmail(user._id.toString());

    return { status: ResultStatus.Success, extensions: [], data: null };
  }

  async resendRegistrationEmail(
    dto: EmailResendingInputDto,
  ): Promise<Result<null>> {
    const EMAIL_KEY = 'email';
    const user = await this.usersRepository.getByEmail(dto.email);

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

    await this.authRepository.updateEmailConfirmationCode(
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
  }

  async recoverPassword(dto: PasswordRecoveryInputDto): Promise<Result<null>> {
    const user = await this.usersRepository.getByEmail(dto.email);

    if (!user) {
      return { status: ResultStatus.NotFound, extensions: [], data: null };
    }

    const expiresInMs = config.passwordRecoveryExpiresInMins * 60 * 1000;
    const newCode = randomUUID();

    await this.authRepository.updatePasswordRecoveryCode(
      user._id.toString(),
      newCode,
      new Date(Date.now() + expiresInMs),
    );

    nodemailerService
      .sendEmail(dto.email, emailTemplate.passwordRecovery(newCode))
      .catch((error) => {
        console.error('Failed to send password recovery email: ', error);
      });

    return { status: ResultStatus.Success, extensions: [], data: null };
  }

  async setNewPassword(dto: NewPasswordInputDto): Promise<Result<null>> {
    const RECOVERY_CODE_KEY = 'recoveryCode';
    const user = await this.authRepository.getByPasswordRecoveryCode(
      dto.recoveryCode,
    );

    if (!user || !user.passwordRecovery) {
      return {
        status: ResultStatus.BadRequest,
        extensions: [
          {
            field: RECOVERY_CODE_KEY,
            message: `${RECOVERY_CODE_KEY} is incorrect`,
          },
        ],
        data: null,
      };
    }

    if (user.passwordRecovery.expiresAt < new Date()) {
      return {
        status: ResultStatus.BadRequest,
        extensions: [
          {
            field: RECOVERY_CODE_KEY,
            message: `${RECOVERY_CODE_KEY} has expired`,
          },
        ],
        data: null,
      };
    }

    const passwordHash = await bcryptService.generateHash(dto.newPassword);

    await this.authRepository.setNewPassword(user._id.toString(), passwordHash);

    return { status: ResultStatus.Success, extensions: [], data: null };
  }

  async verifyRefreshToken(
    token: string,
  ): Promise<Result<RefreshTokenPayload>> {
    const tokenPayload = jwtService.verifyToken(
      token,
      config.refreshTokenSecret,
    );

    if (!tokenPayload || !tokenPayload.jti) {
      return { status: ResultStatus.Unauthorized, extensions: [], data: null };
    }

    const session = await this.securityRepository.getSession(
      tokenPayload.deviceId,
      tokenPayload.jti,
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
  }

  async refreshToken(
    refreshToken: RefreshTokenPayload,
  ): Promise<Result<{ accessToken: string; refreshToken: string }>> {
    const jti = randomUUID();

    const { token: accessToken } = jwtService.createToken(
      { userId: refreshToken.userId },
      config.accessTokenSecret,
      config.accessTokenExpiresIn as NonNullable<SignOptions['expiresIn']>,
    );
    const { token: newRefreshToken, exp } = jwtService.createToken(
      { userId: refreshToken.userId, deviceId: refreshToken.deviceId, jti },
      config.refreshTokenSecret,
      config.refreshTokenExpiresIn as NonNullable<SignOptions['expiresIn']>,
    );

    await this.securityRepository.updateSession(
      refreshToken.deviceId,
      jti,
      new Date(),
      new Date(exp * 1000),
    );

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: { accessToken, refreshToken: newRefreshToken },
    };
  }

  async logout(refreshToken: RefreshTokenPayload): Promise<Result<null>> {
    await this.securityRepository.deleteByDeviceId(refreshToken.deviceId);

    return { status: ResultStatus.Success, extensions: [], data: null };
  }
}
