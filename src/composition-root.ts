import { UsersRepository } from './users/repositories/users.repository';
import { UsersQueryRepository } from './users/repositories/users.query-repository';
import { UsersService } from './users/application/users.service';
import { UsersController } from './users/routers/users.controller';
import { SecurityRepository } from './security/repositories/security.repository';
import { SecurityQueryRepository } from './security/repositories/security.query-repository';
import { SecurityService } from './security/application/security.service';
import { SecurityController } from './security/routers/security.controller';
import { AuthRepository } from './auth/repositories/auth.repository';
import { AuthService } from './auth/application/auth.service';
import { AuthController } from './auth/routers/auth.controller';
import { BcryptService } from './core/services/bcrypt.service';
import { JwtService } from './core/services/jwt.service';
import { NodemailerService } from './core/services/nodemailer.service';
import { RateLimitRepository } from './core/repositories/rate-limit.repository';
import { BearerAuthMiddleware } from './core/middlewares/auth/bearer-auth.middleware';
import { RateLimit } from './core/middlewares/rate-limit.middleware';
import { RefreshTokenAuthMiddleware } from './auth/middlewares/refresh-token-auth.middleware';
import { BlogsRepository } from './blogs/repositories/blogs.repository';
import { BlogsService } from './blogs/application/blogs.service';
import { BlogsController } from './blogs/routers/blogs.controller';
import { PostsRepository } from './posts/repositories/posts.repository';
import { PostsQueryRepository } from './posts/repositories/posts.query-repository';
import { PostsService } from './posts/application/posts.service';
import { PostsController } from './posts/routers/posts.controller';
import { CommentsRepository } from './comments/repositories/comments.repository';
import { CommentsQueryRepository } from './comments/repositories/comments.query-repository';
import { CommentsService } from './comments/application/comments.service';
import { CommentsController } from './comments/routers/comments.controller';

export const bcryptService = new BcryptService();
export const jwtService = new JwtService();
export const nodemailerService = new NodemailerService();

export const usersRepository = new UsersRepository();
export const usersQueryRepository = new UsersQueryRepository();
export const securityRepository = new SecurityRepository();
export const securityQueryRepository = new SecurityQueryRepository();
export const authRepository = new AuthRepository();
export const rateLimitRepository = new RateLimitRepository();
export const blogsRepository = new BlogsRepository();
export const postsRepository = new PostsRepository();
export const postsQueryRepository = new PostsQueryRepository();
export const commentsRepository = new CommentsRepository();
export const commentsQueryRepository = new CommentsQueryRepository();

export const usersService = new UsersService(usersRepository, bcryptService);
export const securityService = new SecurityService(securityRepository);
export const authService = new AuthService(
  usersRepository,
  usersService,
  authRepository,
  securityRepository,
  bcryptService,
  jwtService,
  nodemailerService,
);
export const commentsService = new CommentsService(
  commentsRepository,
  postsRepository,
  usersRepository,
);
export const postsService = new PostsService(
  postsRepository,
  blogsRepository,
  commentsService,
);
export const blogsService = new BlogsService(blogsRepository, postsService);

export const bearerAuthMiddleware = new BearerAuthMiddleware(jwtService);
export const rateLimit = new RateLimit(rateLimitRepository);
export const refreshTokenAuthMiddleware = new RefreshTokenAuthMiddleware(
  authService,
);

export const usersController = new UsersController(
  usersService,
  usersQueryRepository,
);
export const securityController = new SecurityController(
  securityService,
  securityQueryRepository,
);
export const authController = new AuthController(
  authService,
  usersQueryRepository,
);
export const blogsController = new BlogsController(blogsService, postsService);
export const postsController = new PostsController(
  postsService,
  postsQueryRepository,
  commentsService,
  commentsQueryRepository,
);
export const commentsController = new CommentsController(
  commentsService,
  commentsQueryRepository,
);
