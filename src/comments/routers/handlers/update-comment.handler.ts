import { Request, Response } from 'express';
import { CommentInputDto } from '../../dto/comment-input.dto';
import { commentsService } from '../../application/comments.service';
import { ResultStatus } from '../../../core/types/result.types';
import { resultToErrorResponse } from '../../../core/utils/result-status.util';

export async function updateCommentHandler(
  req: Request<{ id: string }, {}, CommentInputDto>,
  res: Response,
) {
  const result = await commentsService.update(
    req.params.id,
    req.body,
    req.userId as string,
  );

  if (result.status !== ResultStatus.Success) {
    const error = resultToErrorResponse(result);
    return res.status(error.code).send(error.body);
  }

  res.sendStatus(204);
}
