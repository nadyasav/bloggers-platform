import request from 'supertest';
import { app } from './test-setup-app';
import { config } from '../../src/core/config';
import { LikeStatus } from '../../src/likes/types/like.types';

export async function createPost(): Promise<string> {
  const blog = await request(app)
    .post('/blogs')
    .auth(config.adminLogin, config.adminPassword)
    .send({
      name: 'likes blog',
      description: 'description',
      websiteUrl: 'https://example.com',
    });

  const post = await request(app)
    .post('/posts')
    .auth(config.adminLogin, config.adminPassword)
    .send({
      title: 'post',
      shortDescription: 'short description',
      content: 'content',
      blogId: blog.body.id,
    });

  return post.body.id;
}

export function createComment(postId: string, accessToken: string) {
  return request(app)
    .post(`/posts/${postId}/comments`)
    .set('Authorization', `Bearer ${accessToken}`)
    .send({ content: 'valid comment content' });
}

export function setLikeStatus(
  commentId: string,
  likeStatus: LikeStatus | string,
  accessToken?: string,
) {
  const req = request(app).put(`/comments/${commentId}/like-status`);

  if (accessToken) {
    req.set('Authorization', `Bearer ${accessToken}`);
  }

  return req.send({ likeStatus });
}

export function getComment(commentId: string, accessToken?: string) {
  const req = request(app).get(`/comments/${commentId}`);

  if (accessToken) {
    req.set('Authorization', `Bearer ${accessToken}`);
  }

  return req;
}

export function getPostComments(postId: string, accessToken?: string) {
  const req = request(app).get(`/posts/${postId}/comments`);

  if (accessToken) {
    req.set('Authorization', `Bearer ${accessToken}`);
  }

  return req;
}
