import { WithId } from 'mongodb';
import { Post, PostDb } from '../../types/post.types';

export function mapPostDbToPost(postDb: WithId<PostDb>): Post {
  const { _id, ...rest } = postDb;
  return { id: _id.toString(), ...rest };
}
