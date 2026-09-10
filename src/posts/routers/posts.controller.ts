import { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import { inject, injectable } from 'inversify';
import { PostsService } from '../application/posts.service';
import { PostsQueryRepository } from '../repositories/posts.query-repository';
import { PostQueryDto } from '../dto/post-query.dto';
import { mapItemsToPaginated } from '../../core/mappers/items-to-paginated.mapper';
import { mapPostDbToPost } from './mappers/postdb-to-post.mapper';
import { POST_NOT_FOUND } from '../post.constants';
import { PostInputDto } from '../dto/post-input.dto';
import { BlogIdNotFoundError } from '../errors/blog-id-not-found.error';
import { PostNotFoundError } from '../errors/post-not-found.error';
import { CommentQueryDto } from '../../comments/dto/comment-query.dto';
import { CommentsQueryRepository } from '../../comments/repositories/comments.query-repository';
import { mapCommentDbToCommentView } from '../../comments/routers/mappers/commentdb-to-comment.mapper';
import { CommentsService } from '../../comments/application/comments.service';
import { ResultStatus } from '../../core/types/result.types';
import { resultToErrorResponse } from '../../core/utils/result-status.util';
import { CommentInputDto } from '../../comments/dto/comment-input.dto';

@injectable()
export class PostsController {
  private postsService: PostsService;
  private postsQueryRepository: PostsQueryRepository;
  private commentsService: CommentsService;
  private commentsQueryRepository: CommentsQueryRepository;

  constructor(
    @inject(PostsService) postsService: PostsService,
    @inject(PostsQueryRepository) postsQueryRepository: PostsQueryRepository,
    @inject(CommentsService) commentsService: CommentsService,
    @inject(CommentsQueryRepository)
    commentsQueryRepository: CommentsQueryRepository,
  ) {
    this.postsService = postsService;
    this.postsQueryRepository = postsQueryRepository;
    this.commentsService = commentsService;
    this.commentsQueryRepository = commentsQueryRepository;
  }

  async getPostsHandler(req: Request, res: Response) {
    const query = matchedData<PostQueryDto>(req, {
      locations: ['query'],
      includeOptionals: true,
    });
    const { posts, totalCount } = await this.postsService.getAll(query);

    const result = mapItemsToPaginated(
      posts.map(mapPostDbToPost),
      totalCount,
      query,
    );

    res.status(200).send(result);
  }

  async getPostByIdHandler(req: Request<{ id: string }>, res: Response) {
    const post = await this.postsService.getById(req.params.id);

    if (!post) {
      return res.status(404).send({ message: POST_NOT_FOUND });
    }

    res.status(200).send(mapPostDbToPost(post));
  }

  async createPostHandler(req: Request<{}, {}, PostInputDto>, res: Response) {
    try {
      const newPost = await this.postsService.create(req.body);
      res.status(201).send(mapPostDbToPost(newPost));
    } catch (error) {
      if (error instanceof BlogIdNotFoundError) {
        return res.status(error.statusCode).send({
          errorsMessages: [{ field: 'blogId', message: error.message }],
        });
      }

      throw error;
    }
  }

  async updatePostHandler(
    req: Request<{ id: string }, {}, PostInputDto>,
    res: Response,
  ) {
    try {
      await this.postsService.update(req.params.id, req.body);
      res.status(204).send();
    } catch (error) {
      if (error instanceof PostNotFoundError) {
        return res.status(error.statusCode).send({ message: error.message });
      }

      if (error instanceof BlogIdNotFoundError) {
        return res.status(error.statusCode).send({
          errorsMessages: [{ field: 'blogId', message: error.message }],
        });
      }

      throw error;
    }
  }

  async deletePostHandler(req: Request<{ id: string }>, res: Response) {
    try {
      await this.postsService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof PostNotFoundError) {
        return res.status(error.statusCode).send({ message: error.message });
      }

      throw error;
    }
  }

  async getPostCommentsHandler(req: Request<{ id: string }>, res: Response) {
    const post = await this.postsQueryRepository.getById(req.params.id);

    if (!post) {
      return res.status(404).send({ message: POST_NOT_FOUND });
    }

    const query = matchedData<CommentQueryDto>(req, {
      locations: ['query'],
      includeOptionals: true,
    });
    const { comments, totalCount } =
      await this.commentsQueryRepository.getByPostId(req.params.id, query);
    const paginatedComments = mapItemsToPaginated(
      comments.map(mapCommentDbToCommentView),
      totalCount,
      query,
    );

    res.status(200).send(paginatedComments);
  }

  async createPostCommentHandler(
    req: Request<{ id: string }, {}, CommentInputDto>,
    res: Response,
  ) {
    const result = await this.commentsService.create(
      req.body,
      req.params.id,
      req.userId as string,
    );

    if (result.status !== ResultStatus.Success) {
      const error = resultToErrorResponse(result);
      return res.status(error.code).send(error.body);
    }

    const comment = await this.commentsQueryRepository.getById(result.data!);

    if (!comment) {
      throw new Error();
    }

    res.status(201).send(mapCommentDbToCommentView(comment));
  }
}
