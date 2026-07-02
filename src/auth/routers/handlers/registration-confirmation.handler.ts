import { Request, Response } from 'express';
import { RegistrationConfirmationInputDto } from '../../dto/registration-confirmation-input.dto';
import { authService } from '../../application/auth.service';
import { ResultStatus } from '../../../core/types/result.types';
import { resultToErrorResponse } from '../../../core/utils/result-status.util';

export async function registrationConfirmationHandler(
  req: Request<{}, {}, RegistrationConfirmationInputDto>,
  res: Response,
) {
  const result = await authService.confirmRegistration(req.body);

  if (result.status !== ResultStatus.Success) {
    const error = resultToErrorResponse(result);
    return res.status(error.code).send(error.body);
  }

  res.sendStatus(204);
}
