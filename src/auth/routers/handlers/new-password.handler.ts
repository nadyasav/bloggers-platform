import { Request, Response } from 'express';
import { authService } from '../../application/auth.service';
import { ResultStatus } from '../../../core/types/result.types';
import { resultToErrorResponse } from '../../../core/utils/result-status.util';
import { NewPasswordInputDto } from '../../dto/new-password-input.dto';

export async function newPasswordHandler(
  req: Request<{}, {}, NewPasswordInputDto>,
  res: Response,
) {
  const result = await authService.setNewPassword(req.body);

  if (result.status !== ResultStatus.Success) {
    const error = resultToErrorResponse(result);
    return res.status(error.code).send(error.body);
  }

  res.sendStatus(204);
}
