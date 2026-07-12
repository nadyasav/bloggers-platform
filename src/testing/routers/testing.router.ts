import { Router, Response } from 'express';
import {
  blogsCollection,
  commentsCollection,
  postsCollection,
  usersCollection,
  sessionsCollection,
  rateLimitCollection,
} from '../../db/db';

export const testingRouter = Router();

testingRouter.delete('/all-data', async (_, res: Response) => {
  await blogsCollection.deleteMany({});
  await postsCollection.deleteMany({});
  await usersCollection.deleteMany({});
  await commentsCollection.deleteMany({});
  await sessionsCollection.deleteMany({});
  await rateLimitCollection.deleteMany({});
  res.status(204).send();
});
