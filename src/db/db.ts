import { Collection, Db, MongoClient } from 'mongodb';
import { BlogDb } from '../blogs/types/blog.types';
import { PostDb } from '../posts/types/post.types';
import { UserDb } from '../users/types/user.types';

const DB_NAME = 'bloggers-platform';
const BLOGS_COLLECTION_NAME = 'blogs';
const POSTS_COLLECTION_NAME = 'posts';
const USERS_COLLECTION_NAME = 'users';

export let client: MongoClient;
export let blogsCollection: Collection<BlogDb>;
export let postsCollection: Collection<PostDb>;
export let usersCollection: Collection<UserDb>;

export const connectToDb = async (): Promise<void> => {
  client = new MongoClient(process.env.MONGODB_URL!);
  const db: Db = client.db(DB_NAME);

  blogsCollection = db.collection<BlogDb>(BLOGS_COLLECTION_NAME);
  postsCollection = db.collection<PostDb>(POSTS_COLLECTION_NAME);
  usersCollection = db.collection<UserDb>(USERS_COLLECTION_NAME);

  try {
    await client.connect();
    await db.command({ ping: 1 });
    console.log('Connected to database');
  } catch (error) {
    await client.close();
    throw new Error(`Failed to connect to database: ${error}`);
  }
};
