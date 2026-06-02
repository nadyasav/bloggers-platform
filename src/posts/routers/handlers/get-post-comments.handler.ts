import { Request, Response } from 'express';
import { postsQueryRepository } from '../../repositories/posts.query-repository';
import { matchedData } from 'express-validator';
import { POST_NOT_FOUND } from '../../post.constants';
import { CommentQueryDto } from '../../../comments/dto/comment-query.dto';
import { commentsQueryRepository } from '../../../comments/repositories/comments.query-repository';
import { mapItemsToPaginated } from '../../../core/mappers/items-to-paginated.mapper';
import { mapCommentDbToCommentView } from '../../../comments/routers/mappers/commentdb-to-comment.mapper';

export async function getPostCommentsHandler(
  req: Request<{ id: string }>,
  res: Response,
) {
  const post = await postsQueryRepository.getById(req.params.id);

  if (!post) {
    return res.status(404).send({ message: POST_NOT_FOUND });
  }

  const query = matchedData<CommentQueryDto>(req, {
    locations: ['query'],
    includeOptionals: true,
  });
  const { comments, totalCount } = await commentsQueryRepository.getByPostId(
    req.params.id,
    query,
  );
  const paginatedComments = mapItemsToPaginated(
    comments.map(mapCommentDbToCommentView),
    totalCount,
    query,
  );

  res.status(200).send(paginatedComments);
}
