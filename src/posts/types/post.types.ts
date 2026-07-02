export type Post = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
};

export type PostDb = Omit<Post, 'id'>;
