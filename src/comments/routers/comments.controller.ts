import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { CommentsService } from '../application/comments.service';
import { CommentsQueryRepository } from '../repositories/comments.query-repository';
import { COMMENT_ERRORS } from '../comment.constants';
import { mapCommentDbToCommentView } from './mappers/commentdb-to-comment.mapper';
import { CommentInputDto } from '../dto/comment-input.dto';
import { ResultStatus } from '../../core/types/result.types';
import { resultToErrorResponse } from '../../core/utils/result-status.util';

@injectable()
export class CommentsController {
  private commentsService: CommentsService;
  private commentsQueryRepository: CommentsQueryRepository;

  constructor(
    @inject(CommentsService) commentsService: CommentsService,
    @inject(CommentsQueryRepository)
    commentsQueryRepository: CommentsQueryRepository,
  ) {
    this.commentsService = commentsService;
    this.commentsQueryRepository = commentsQueryRepository;
  }

  async getCommentHandler(req: Request<{ id: string }>, res: Response) {
    const comment = await this.commentsQueryRepository.getById(req.params.id);

    if (!comment) {
      return res.status(404).send({ message: COMMENT_ERRORS.NOT_FOUND });
    }

    res.status(200).send(mapCommentDbToCommentView(comment));
  }

  async updateCommentHandler(
    req: Request<{ id: string }, {}, CommentInputDto>,
    res: Response,
  ) {
    const result = await this.commentsService.update(
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

  async deleteCommentHandler(req: Request<{ id: string }>, res: Response) {
    const result = await this.commentsService.delete(
      req.params.id,
      req.userId as string,
    );

    if (result.status !== ResultStatus.Success) {
      const error = resultToErrorResponse(result);
      return res.status(error.code).send(error.body);
    }

    res.sendStatus(204);
  }
}
