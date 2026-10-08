import {
  LikesCounters,
  LikesInfo,
  LikeStatus,
} from '../../likes/types/like.types';
import { WithId } from 'mongodb';

export type CommentatorInfo = {
  userId: string;
  userLogin: string;
};

export type Comment = {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: Date;
  likesInfo: LikesInfo;
};

export type CommentDb = {
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: Date;
  postId: string;
  likesCounters: LikesCounters;
};

export type CommentDbWithStatus = WithId<CommentDb> & {
  myStatus: LikeStatus;
};
