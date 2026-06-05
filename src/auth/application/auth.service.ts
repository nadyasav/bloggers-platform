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
        console.error('Failed to send confirmation email: ', error);
      });

    return { status: ResultStatus.Success, extensions: [], data: null };
  },
};
