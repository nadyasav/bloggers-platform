import express, { Express, Request, Response, NextFunction } from 'express';
import { blogsRouter } from './blogs/routers/blogs.router';
import { postsRouter } from './posts/routers/posts.router';
import { testingRouter } from './testing/routers/testing.router';

export const setupApp = (app: Express) => {
  app.use(express.json());

  app.get('/', (_, res) => {
    res.status(200).send('Hello world!');
  });

  app.use('/blogs', blogsRouter);
  app.use('/posts', postsRouter);
  app.use('/testing', testingRouter);

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
