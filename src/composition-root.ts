import { Container } from 'inversify';
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

export const container = new Container();

container.bind(BcryptService).toSelf();
container.bind(JwtService).toSelf();
container.bind(NodemailerService).toSelf();

container.bind(UsersRepository).toSelf();
container.bind(UsersQueryRepository).toSelf();
container.bind(SecurityRepository).toSelf();
container.bind(SecurityQueryRepository).toSelf();
container.bind(AuthRepository).toSelf();
container.bind(RateLimitRepository).toSelf();
container.bind(BlogsRepository).toSelf();
container.bind(PostsRepository).toSelf();
container.bind(PostsQueryRepository).toSelf();
container.bind(CommentsRepository).toSelf();
container.bind(CommentsQueryRepository).toSelf();

container.bind(UsersService).toSelf();
container.bind(SecurityService).toSelf();
container.bind(AuthService).toSelf();
container.bind(CommentsService).toSelf();
container.bind(PostsService).toSelf();
container.bind(BlogsService).toSelf();

container.bind(BearerAuthMiddleware).toSelf();
container.bind(RateLimit).toSelf();
container.bind(RefreshTokenAuthMiddleware).toSelf();

container.bind(UsersController).toSelf();
container.bind(SecurityController).toSelf();
container.bind(AuthController).toSelf();
container.bind(BlogsController).toSelf();
container.bind(PostsController).toSelf();
container.bind(CommentsController).toSelf();
