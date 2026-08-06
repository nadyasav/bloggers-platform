import express, { Express, Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import { blogsRouter } from './blogs/routers/blogs.router';
import { postsRouter } from './posts/routers/posts.router';
import { testingRouter } from './testing/routers/testing.router';
import { usersRouter } from './users/routers/users.router';
import { authRouter } from './auth/routers/auth.router';
import { commentsRouter } from './comments/routers/comments.router';
import { securityRouter } from './security/routers/security.router';
import { config } from './core/config';

export const setupApp = (app: Express) => {
  app.set('trust proxy', config.trustProxy);
  app.use(express.json());
  app.use(cookieParser());

  app.get('/', (_, res) => {
    res.status(200).send('Hello world!');
  });

  app.use('/blogs', blogsRouter);
  app.use('/posts', postsRouter);
  app.use('/users', usersRouter);
  app.use('/auth', authRouter);
  app.use('/comments', commentsRouter);
  app.use('/security', securityRouter);

  if (process.env.NODE_ENV === 'test') {
    app.use('/testing', testingRouter);
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).send({ message: 'Invalid JSON' });
    }

    res
      .status(err.status || 500)
      .send({ message: err.message || 'Internal server error' });
  });

  return app;
};
