import { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import { blogsService } from '../../application/blogs.service';
import { mapBlogDbToBlog } from '../mappers/blogdb-to-blog.mapper';
import { mapItemsToPaginated } from '../../../core/mappers/items-to-paginated.mapper';
import { BlogQueryDto } from '../../dto/blog-query.dto';

export async function getBlogsHandler(req: Request, res: Response) {
  const query = matchedData<BlogQueryDto>(req, {
    locations: ['query'],
    includeOptionals: true,
  });
  const { blogs, totalCount } = await blogsService.getAll(query);

  const result = mapItemsToPaginated(
    blogs.map(mapBlogDbToBlog),
    totalCount,
    query,
  );

  res.status(200).send(result);
}
