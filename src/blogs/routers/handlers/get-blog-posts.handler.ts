import { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import { PostQueryDto } from '../../../posts/dto/post-query.dto';
import { postsService } from '../../../posts/application/posts.service';
import { mapItemsToPaginated } from '../../../core/mappers/items-to-paginated.mapper';
import { mapPostDbToPost } from '../../../posts/routers/mappers/postdb-to-post.mapper';
import { BlogNotFoundError } from '../../errors/blog-not-found.error';

export async function getBlogPostsHandler(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    const query = matchedData<PostQueryDto>(req, {
      locations: ['query'],
      includeOptionals: true,
    });
    const { posts, totalCount } = await postsService.getAll(
      query,
      req.params.id,
    );
    const result = mapItemsToPaginated(
      posts.map(mapPostDbToPost),
      totalCount,
      query,
    );

    res.status(200).send(result);
  } catch (error) {
    if (error instanceof BlogNotFoundError) {
      return res.status(error.statusCode).send({ message: error.message });
    }

    throw error;
  }
}
