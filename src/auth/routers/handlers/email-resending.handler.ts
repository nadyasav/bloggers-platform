import { Request, Response } from 'express';
import { authService } from '../../application/auth.service';
import { ResultStatus } from '../../../core/types/result.types';
import { resultToErrorResponse } from '../../../core/utils/result-status.util';
import { EmailResendingInputDto } from '../../dto/email-resending-input.dto';

export async function emailResendingHandler(
  req: Request<{}, {}, EmailResendingInputDto>,
  res: Response,
) {
  const result = await authService.resendRegistrationEmail(req.body);

  if (result.status !== ResultStatus.Success) {
    const error = resultToErrorResponse(result);
    return res.status(error.code).send(error.body);
  }

  res.sendStatus(204);
}
