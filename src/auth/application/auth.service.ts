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

    if (!user.emailConfirmation.isConfirmed) {
      return { status: ResultStatus.Unauthorized, extensions: [], data: null };
    }

    const accessToken = jwtService.createToken(
      user._id.toString(),
      config.accessTokenSecret,
      config.accessTokenExpiresIn as SignOptions['expiresIn'],
    );

    return { status: ResultStatus.Success, extensions: [], data: accessToken };
  },

  async register(dto: RegistrationInputDto): Promise<Result<string | null>> {
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
};
