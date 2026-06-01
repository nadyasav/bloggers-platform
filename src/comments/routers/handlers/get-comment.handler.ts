import { Request, Response } from 'express';
import { commentsQueryRepository } from '../../repositories/comments.query-repository';
import { COMMENT_NOT_FOUND } from '../../comment.constants';
import { mapCommentDbToCommentView } from '../mappers/commentdb-to-comment.mapper';

export async function getCommentHandler(
  req: Request<{ id: string }>,
  res: Response,
) {
  const comment = await commentsQueryRepository.getById(req.params.id);

  if (!comment) {
    return res.status(404).send({ message: COMMENT_NOT_FOUND });
  }

  res.status(200).send(mapCommentDbToCommentView(comment));
}
