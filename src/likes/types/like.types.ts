export enum LikeStatus {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

export type LikesCounters = {
  likesCount: number;
  dislikesCount: number;
};

export type LikesInfo = LikesCounters & {
  myStatus: LikeStatus;
};

export type LikeDb = {
  parentId: string;
  authorId: string;
  status: LikeStatus;
  createdAt: Date;
};
