export type Blog = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
};

export type BlogDb = Omit<Blog, 'id'>;
