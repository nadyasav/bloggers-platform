import { Request, Response } from 'express';
import { CommentInputDto } from '../../../comments/dto/comment-input.dto';
import { commentsService } from '../../../comments/application/comments.service';
import { ResultStatus } from '../../../core/types/result.types';
import { resultToErrorResponse } from '../../../core/utils/result-status.util';
import { commentsQueryRepository } from '../../../comments/repositories/comments.query-repository';
import { mapCommentDbToCommentView } from '../../../comments/routers/mappers/commentdb-to-comment.mapper';

export async function createPostCommentHandler(
  req: Request<{ id: string }, {}, CommentInputDto>,
  res: Response,
) {
  const result = await commentsService.create(
    req.body,
    req.params.id,
    req.userId as string,
  );

  if (result.status !== ResultStatus.Success) {
    const error = resultToErrorResponse(result);
    return res.status(error.code).send(error.body);
  }

  const comment = await commentsQueryRepository.getById(result.data!);

  if (!comment) {
    throw new Error();
  }

  res.status(201).send(mapCommentDbToCommentView(comment));
}
