import { Request, Response } from 'express';
import { LoginInputDto } from '../../dto/login-input.dto';
import { authService } from '../../application/auth.service';
import { ResultStatus } from '../../../core/types/result.types';

export async function loginHandler(
  req: Request<{}, {}, LoginInputDto>,
  res: Response,
) {
  const result = await authService.login(
    req.body.loginOrEmail,
    req.body.password,
  );

  if (result.status === ResultStatus.Unauthorized) {
    return res.status(401).send({ message: 'Invalid credentials' });
  }

  res.status(200).send({ accessToken: result.data });
}
