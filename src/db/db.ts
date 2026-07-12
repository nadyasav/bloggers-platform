import { Collection, Db, MongoClient } from 'mongodb';
import { BlogDb } from '../blogs/types/blog.types';
import { PostDb } from '../posts/types/post.types';
import { UserDb } from '../users/types/user.types';
import { CommentDb } from '../comments/types/comment.types';
import { DeviceSessionDb } from '../security/types/security.types';
import { ApiRequestDb } from '../core/types/rate-limit.types';
import { config } from '../core/config';

const DB_NAME = 'bloggers-platform';
const BLOGS_COLLECTION_NAME = 'blogs';
const POSTS_COLLECTION_NAME = 'posts';
const USERS_COLLECTION_NAME = 'users';
const COMMENTS_COLLECTION_NAME = 'comments';
const SESSIONS_COLLECTION_NAME = 'sessions';
const RATE_LIMIT_COLLECTION_NAME = 'rateLimit';

export let client: MongoClient;
export let blogsCollection: Collection<BlogDb>;
export let postsCollection: Collection<PostDb>;
export let usersCollection: Collection<UserDb>;
export let commentsCollection: Collection<CommentDb>;
export let sessionsCollection: Collection<DeviceSessionDb>;
export let rateLimitCollection: Collection<ApiRequestDb>;

export const connectToDb = async (): Promise<void> => {
  client = new MongoClient(config.mongodbUrl);
  const db: Db = client.db(DB_NAME);

  blogsCollection = db.collection<BlogDb>(BLOGS_COLLECTION_NAME);
  postsCollection = db.collection<PostDb>(POSTS_COLLECTION_NAME);
  usersCollection = db.collection<UserDb>(USERS_COLLECTION_NAME);
  commentsCollection = db.collection<CommentDb>(COMMENTS_COLLECTION_NAME);
  sessionsCollection = db.collection<DeviceSessionDb>(SESSIONS_COLLECTION_NAME);
  rateLimitCollection = db.collection<ApiRequestDb>(RATE_LIMIT_COLLECTION_NAME);

  try {
    await client.connect();
    await db.command({ ping: 1 });
    await sessionsCollection.createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 0 },
    );
    await rateLimitCollection.createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 0 },
    );
    console.log('Connected to database');
  } catch (error) {
    await client.close();
    throw new Error(`Failed to connect to database: ${error}`);
  }
};
