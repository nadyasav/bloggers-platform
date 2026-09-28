import { Router, Response } from 'express';
import {
  blogsCollection,
  postsCollection,
  usersCollection,
  sessionsCollection,
  rateLimitCollection,
} from '../../db/db';
import { CommentModel } from '../../comments/domain/comment.entity';
import { LikeModel } from '../../likes/domain/like.entity';

export const testingRouter = Router();

testingRouter.delete('/all-data', async (_, res: Response) => {
  await blogsCollection.deleteMany({});
  await postsCollection.deleteMany({});
  await usersCollection.deleteMany({});
  await CommentModel.deleteMany({});
  await LikeModel.deleteMany({});
  await sessionsCollection.deleteMany({});
  await rateLimitCollection.deleteMany({});
  res.status(204).send();
});
