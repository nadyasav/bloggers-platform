import { Request, Response } from 'express';
import { LoginInputDto } from '../../dto/login-input.dto';
import { authService } from '../../application/auth.service';
import { ResultStatus } from '../../../core/types/result.types';
import { REFRESH_TOKEN_COOKIE } from '../../auth.constants';

export async function loginHandler(
  req: Request<{}, {}, LoginInputDto>,
  res: Response,
) {
  const result = await authService.login(req.body);

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
