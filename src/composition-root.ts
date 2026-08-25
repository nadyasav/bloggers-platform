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

export const bcryptService = new BcryptService();
export const jwtService = new JwtService();
export const nodemailerService = new NodemailerService();

export const usersRepository = new UsersRepository();
export const usersQueryRepository = new UsersQueryRepository();
export const securityRepository = new SecurityRepository();
export const securityQueryRepository = new SecurityQueryRepository();
export const authRepository = new AuthRepository();
export const rateLimitRepository = new RateLimitRepository();

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
