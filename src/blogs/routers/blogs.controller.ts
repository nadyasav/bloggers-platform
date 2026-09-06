import { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import { BlogsService } from '../application/blogs.service';
import { BlogPostInputDto } from '../../posts/dto/blog-post-input.dto';
import { PostsService } from '../../posts/application/posts.service';
import { mapPostDbToPost } from '../../posts/routers/mappers/postdb-to-post.mapper';
import { BlogNotFoundError } from '../errors/blog-not-found.error';
import { BlogQueryDto } from '../dto/blog-query.dto';
import { mapItemsToPaginated } from '../../core/mappers/items-to-paginated.mapper';
import { mapBlogDbToBlog } from './mappers/blogdb-to-blog.mapper';
import { BLOG_NOT_FOUND } from '../blog.constants';
import { PostQueryDto } from '../../posts/dto/post-query.dto';
import { BlogInputDto } from '../dto/blog-input.dto';

export class BlogsController {
  private blogsService: BlogsService;
  private postsService: PostsService;

  constructor(blogsService: BlogsService, postsService: PostsService) {
    this.blogsService = blogsService;
    this.postsService = postsService;
  }

  async getBlogsHandler(req: Request, res: Response) {
    const query = matchedData<BlogQueryDto>(req, {
      locations: ['query'],
      includeOptionals: true,
    });
    const { blogs, totalCount } = await this.blogsService.getAll(query);

    const result = mapItemsToPaginated(
      blogs.map(mapBlogDbToBlog),
      totalCount,
      query,
    );

    res.status(200).send(result);
  }

  async getBlogByIdHandler(req: Request<{ id: string }>, res: Response) {
    const blog = await this.blogsService.getById(req.params.id);

    if (!blog) {
      return res.status(404).send({ message: BLOG_NOT_FOUND });
    }

    res.status(200).send(mapBlogDbToBlog(blog));
  }

  async getBlogPostsHandler(req: Request<{ id: string }>, res: Response) {
    try {
      const query = matchedData<PostQueryDto>(req, {
        locations: ['query'],
        includeOptionals: true,
      });
      const { posts, totalCount } = await this.postsService.getAll(
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

  async createBlogHandler(req: Request<{}, {}, BlogInputDto>, res: Response) {
    const newBlog = await this.blogsService.create(req.body);
    res.status(201).send(mapBlogDbToBlog(newBlog));
  }

  async createBlogPostHandler(
    req: Request<{ id: string }, {}, BlogPostInputDto>,
    res: Response,
  ) {
    try {
      const newPost = await this.postsService.createByBlogId(
        req.params.id,
        req.body,
      );
      res.status(201).send(mapPostDbToPost(newPost));
    } catch (error) {
      if (error instanceof BlogNotFoundError) {
        return res.status(error.statusCode).send({ message: error.message });
      }

      throw error;
    }
  }

  async updateBlogHandler(
    req: Request<{ id: string }, {}, BlogInputDto>,
    res: Response,
  ) {
    try {
      await this.blogsService.update(req.params.id, req.body);
      res.status(204).send();
    } catch (error) {
      if (error instanceof BlogNotFoundError) {
        return res.status(error.statusCode).send({ message: error.message });
      }

      throw error;
    }
  }

  async deleteBlogHandler(req: Request<{ id: string }>, res: Response) {
    try {
      await this.blogsService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof BlogNotFoundError) {
        return res.status(error.statusCode).send({ message: error.message });
      }

      throw error;
    }
  }
}
