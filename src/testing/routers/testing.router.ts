import { Router, Response } from 'express';
import { blogsCollection, postsCollection, usersCollection } from '../../db/db';

export const testingRouter = Router();

testingRouter.delete('/all-data', async (_, res: Response) => {
  await blogsCollection.deleteMany({});
  await postsCollection.deleteMany({});
  await usersCollection.deleteMany({});
  res.status(204).send();
});
