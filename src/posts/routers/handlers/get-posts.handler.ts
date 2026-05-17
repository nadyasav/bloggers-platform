import { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import { postsService } from '../../application/posts.service';
import { mapPostDbToPost } from '../mappers/postdb-to-post.mapper';
import { mapItemsToPaginated } from '../../../core/mappers/items-to-paginated.mapper';
import { PostQueryDto } from '../../dto/post-query.dto';

export async function getPostsHandler(req: Request, res: Response) {
  const query = matchedData<PostQueryDto>(req, {
    locations: ['query'],
    includeOptionals: true,
  });
  const { posts, totalCount } = await postsService.getAll(query);

  const result = mapItemsToPaginated(
    posts.map(mapPostDbToPost),
    totalCount,
    query,
  );

  res.status(200).send(result);
}
