import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { connectToDb, client } from '../../src/db/db';
import { LikeStatus } from '../../src/likes/types/like.types';
import { Comment } from '../../src/comments/types/comment.types';
import {
  USERS,
  createConfirmedUser,
  login,
  clearDb,
} from '../utils/auth-utils';
import {
  createPost,
  createComment,
  setLikeStatus,
  getComment,
  getPostComments,
} from '../utils/likes-utils';

const NON_EXISTING_OBJECT_ID = '000000000000000000000000';

let mongoServer: MongoMemoryReplSet;
let postId: string;
let commentId: string;
let usersTokens: { first: string; second: string; third: string };

beforeAll(async () => {
  mongoServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await connectToDb(mongoServer.getUri());
});

afterAll(async () => {
  await client.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await clearDb();

  await createConfirmedUser(USERS.first);
  await createConfirmedUser(USERS.second);
  await createConfirmedUser(USERS.third);

  usersTokens = {
    first: (await login(USERS.first.login, USERS.first.password)).body
      .accessToken,
    second: (await login(USERS.second.login, USERS.second.password)).body
      .accessToken,
    third: (await login(USERS.third.login, USERS.third.password)).body
      .accessToken,
  };

  postId = await createPost();
  commentId = (await createComment(postId, usersTokens.first)).body.id;
});

describe('PUT /comments/:id/like-status', () => {
  it('should return 401 without an access token', async () => {
    const response = await setLikeStatus(commentId, LikeStatus.Like);

    expect(response.status).toBe(401);
  });

  it('should return 400 for a status outside the allowed values', async () => {
    const response = await setLikeStatus(
      commentId,
      'wrong_like_status',
      usersTokens.first,
    );

    expect(response.status).toBe(400);
    expect(response.body.errorsMessages[0].field).toBe('likeStatus');
  });

  it('should return 404 for a non-existing comment', async () => {
    const response = await setLikeStatus(
      NON_EXISTING_OBJECT_ID,
      LikeStatus.Like,
      usersTokens.first,
    );

    expect(response.status).toBe(404);
  });

  it('should count the like and return the status to the authorized user', async () => {
    const response = await setLikeStatus(
      commentId,
      LikeStatus.Like,
      usersTokens.first,
    );

    expect(response.status).toBe(204);

    const comment = await getComment(commentId, usersTokens.first);

    expect(comment.body.likesInfo).toEqual({
      likesCount: 1,
      dislikesCount: 0,
      myStatus: LikeStatus.Like,
    });
  });

  it('should keep the counters correct on every status change', async () => {
    const expectLikesInfo = async (
      likesCount: number,
      dislikesCount: number,
      myStatus: LikeStatus,
    ) => {
      const comment = await getComment(commentId, usersTokens.first);

      expect(comment.body.likesInfo).toEqual({
        likesCount,
        dislikesCount,
        myStatus,
      });
    };

    await setLikeStatus(commentId, LikeStatus.Like, usersTokens.first);
    await expectLikesInfo(1, 0, LikeStatus.Like);

    await setLikeStatus(commentId, LikeStatus.Like, usersTokens.first);
    await expectLikesInfo(1, 0, LikeStatus.Like);

    await setLikeStatus(commentId, LikeStatus.Dislike, usersTokens.first);
    await expectLikesInfo(0, 1, LikeStatus.Dislike);

    await setLikeStatus(commentId, LikeStatus.Like, usersTokens.first);
    await expectLikesInfo(1, 0, LikeStatus.Like);

    await setLikeStatus(commentId, LikeStatus.None, usersTokens.first);
    await expectLikesInfo(0, 0, LikeStatus.None);

    await setLikeStatus(commentId, LikeStatus.Dislike, usersTokens.first);
    await expectLikesInfo(0, 1, LikeStatus.Dislike);

    await setLikeStatus(commentId, LikeStatus.None, usersTokens.first);
    await expectLikesInfo(0, 0, LikeStatus.None);
  });

  it('should count every like when users vote at the same time', async () => {
    await Promise.all(
      Object.values(usersTokens).map((token) =>
        setLikeStatus(commentId, LikeStatus.Like, token),
      ),
    );

    const comment = await getComment(commentId);

    expect(comment.body.likesInfo.likesCount).toBe(3);
  });
});

describe('GET /comments/:id', () => {
  it('should return the same counters and a different status for each user', async () => {
    await setLikeStatus(commentId, LikeStatus.Like, usersTokens.first);
    await setLikeStatus(commentId, LikeStatus.Dislike, usersTokens.second);

    const firstUserResponse = await getComment(commentId, usersTokens.first);
    const secondUserResponse = await getComment(commentId, usersTokens.second);

    expect(firstUserResponse.body.likesInfo).toEqual({
      likesCount: 1,
      dislikesCount: 1,
      myStatus: LikeStatus.Like,
    });
    expect(secondUserResponse.body.likesInfo).toEqual({
      likesCount: 1,
      dislikesCount: 1,
      myStatus: LikeStatus.Dislike,
    });
  });

  it('should return counters and the None status to an unauthorized user', async () => {
    await setLikeStatus(commentId, LikeStatus.Like, usersTokens.first);

    const response = await getComment(commentId);

    expect(response.status).toBe(200);
    expect(response.body.likesInfo).toEqual({
      likesCount: 1,
      dislikesCount: 0,
      myStatus: LikeStatus.None,
    });
  });
});

describe('GET /posts/:id/comments', () => {
  it("should return the requesting user's status for every comment in the list", async () => {
    const secondCommentResponse = await createComment(
      postId,
      usersTokens.first,
    );
    const secondCommentId = secondCommentResponse.body.id;

    await setLikeStatus(commentId, LikeStatus.Like, usersTokens.first);
    await setLikeStatus(
      secondCommentId,
      LikeStatus.Dislike,
      usersTokens.second,
    );

    const response = await getPostComments(postId, usersTokens.first);

    expect(response.status).toBe(200);

    const comments: Comment[] = response.body.items;

    const firstComment = comments.find((comment) => comment.id === commentId);
    const secondComment = comments.find(
      (comment) => comment.id === secondCommentId,
    );

    expect(firstComment?.likesInfo.myStatus).toBe(LikeStatus.Like);
    expect(secondComment?.likesInfo.myStatus).toBe(LikeStatus.None);
  });
});
