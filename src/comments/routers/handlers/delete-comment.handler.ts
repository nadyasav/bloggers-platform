import { Request, Response } from 'express';
import { commentsService } from '../../application/comments.service';
import { ResultStatus } from '../../../core/types/result.types';
import { resultToErrorResponse } from '../../../core/utils/result-status.util';

export async function deleteCommentHandler(
  req: Request<{ id: string }>,
  res: Response,
) {
  const result = await commentsService.delete(
    req.params.id,
    req.userId as string,
  );

  if (result.status !== ResultStatus.Success) {
    const error = resultToErrorResponse(result);
    return res.status(error.code).send(error.body);
  }

  res.sendStatus(204);
}
