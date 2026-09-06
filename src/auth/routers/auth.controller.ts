import { Request, Response } from 'express';
import { AuthService } from '../application/auth.service';
import { UsersQueryRepository } from '../../users/repositories/users.query-repository';
import { DEFAULT_DEVICE_NAME, REFRESH_TOKEN_COOKIE } from '../auth.constants';
import { DEFAULT_IP } from '../../core/core.constants';
import { ResultStatus } from '../../core/types/result.types';
import { LoginInputDto } from '../dto/login-input.dto';
import { PasswordRecoveryInputDto } from '../dto/password-recovery-input.dto';
import { resultToErrorResponse } from '../../core/utils/result-status.util';
import { NewPasswordInputDto } from '../dto/new-password-input.dto';
import { RegistrationInputDto } from '../dto/registration-input.dto';
import { RegistrationConfirmationInputDto } from '../dto/registration-confirmation-input.dto';
import { EmailResendingInputDto } from '../dto/email-resending-input.dto';
import { mapUserDbToMeView } from './mappers/userdb-to-me-view.mapper';

export class AuthController {
  private authService: AuthService;
  private usersQueryRepository: UsersQueryRepository;

  constructor(
    authService: AuthService,
    usersQueryRepository: UsersQueryRepository,
  ) {
    this.authService = authService;
    this.usersQueryRepository = usersQueryRepository;
  }

  async loginHandler(req: Request<{}, {}, LoginInputDto>, res: Response) {
    const deviceName = req.headers['user-agent'] ?? DEFAULT_DEVICE_NAME;
    const ip = req.ip ?? DEFAULT_IP;
    const result = await this.authService.login(req.body, deviceName, ip);

    if (result.status !== ResultStatus.Success) {
      if (result.status === ResultStatus.Unauthorized) {
        return res.status(401).send({ message: 'Invalid credentials' });
      }

      throw new Error();
    }

    res.cookie(REFRESH_TOKEN_COOKIE, result.data.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    res.status(200).send({ accessToken: result.data.accessToken });
  }

  async passwordRecoveryHandler(
    req: Request<{}, {}, PasswordRecoveryInputDto>,
    res: Response,
  ) {
    const result = await this.authService.recoverPassword(req.body);

    if (
      result.status !== ResultStatus.Success &&
      result.status !== ResultStatus.NotFound
    ) {
      const error = resultToErrorResponse(result);
      return res.status(error.code).send(error.body);
    }

    res.sendStatus(204);
  }

  async newPasswordHandler(
    req: Request<{}, {}, NewPasswordInputDto>,
    res: Response,
  ) {
    const result = await this.authService.setNewPassword(req.body);

    if (result.status !== ResultStatus.Success) {
      const error = resultToErrorResponse(result);
      return res.status(error.code).send(error.body);
    }

    res.sendStatus(204);
  }

  async registrationHandler(
    req: Request<{}, {}, RegistrationInputDto>,
    res: Response,
  ) {
    const result = await this.authService.register(req.body);

    if (result.status !== ResultStatus.Success) {
      const error = resultToErrorResponse(result);
      return res.status(error.code).send(error.body);
    }

    res.sendStatus(204);
  }

  async registrationConfirmationHandler(
    req: Request<{}, {}, RegistrationConfirmationInputDto>,
    res: Response,
  ) {
    const result = await this.authService.confirmRegistration(req.body);

    if (result.status !== ResultStatus.Success) {
      const error = resultToErrorResponse(result);
      return res.status(error.code).send(error.body);
    }

    res.sendStatus(204);
  }

  async emailResendingHandler(
    req: Request<{}, {}, EmailResendingInputDto>,
    res: Response,
  ) {
    const result = await this.authService.resendRegistrationEmail(req.body);

    if (result.status !== ResultStatus.Success) {
      const error = resultToErrorResponse(result);
      return res.status(error.code).send(error.body);
    }

    res.sendStatus(204);
  }

  async refreshTokenHandler(req: Request, res: Response) {
    const result = await this.authService.refreshToken(
      req.refreshTokenPayload!,
    );

    if (result.status !== ResultStatus.Success) {
      throw new Error();
    }

    res.cookie(REFRESH_TOKEN_COOKIE, result.data.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    res.status(200).send({ accessToken: result.data.accessToken });
  }

  async logoutHandler(req: Request, res: Response) {
    await this.authService.logout(req.refreshTokenPayload!);

    res.clearCookie(REFRESH_TOKEN_COOKIE);
    res.sendStatus(204);
  }

  async meHandler(req: Request, res: Response) {
    const user = await this.usersQueryRepository.getById(req.userId as string);

    if (!user) {
      return res.status(401).send({ message: 'Unauthorized' });
    }

    res.status(200).send(mapUserDbToMeView(user));
  }
}
