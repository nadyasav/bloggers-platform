export type CommentatorInfo = {
  userId: string;
  userLogin: string;
};

export type Comment = {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: Date;
};

export type CommentDb = Omit<Comment, 'id'> & {
  postId: string;
};
