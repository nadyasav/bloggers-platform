export type User = {
  id: string;
  login: string;
  email: string;
  createdAt: Date;
};

export type UserDb = Omit<User, 'id'> & {
  passwordHash: string;
};
