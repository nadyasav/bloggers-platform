import { Request, Response } from 'express';
import { authService } from '../../application/auth.service';
import { ResultStatus } from '../../../core/types/result.types';
import { resultToErrorResponse } from '../../../core/utils/result-status.util';
import { PasswordRecoveryInputDto } from '../../dto/password-recovery-input.dto';

export async function passwordRecoveryHandler(
  req: Request<{}, {}, PasswordRecoveryInputDto>,
  res: Response,
) {
  const result = await authService.recoverPassword(req.body);

  if (
    result.status !== ResultStatus.Success &&
    result.status !== ResultStatus.NotFound
  ) {
    const error = resultToErrorResponse(result);
    return res.status(error.code).send(error.body);
  }

  res.sendStatus(204);
}
