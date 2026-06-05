import { Request, Response } from 'express';
import { authService } from '../../application/auth.service';
import { ResultStatus } from '../../../core/types/result.types';
import { resultToErrorResponse } from '../../../core/utils/result-status.util';
import { RegistrationInputDto } from '../../dto/registration-input.dto';

export async function registrationHandler(
  req: Request<{}, {}, RegistrationInputDto>,
  res: Response,
) {
  const result = await authService.register(req.body);

  if (result.status !== ResultStatus.Success) {
    const error = resultToErrorResponse(result);
    return res.status(error.code).send(error.body);
  }

  res.sendStatus(204);
}
