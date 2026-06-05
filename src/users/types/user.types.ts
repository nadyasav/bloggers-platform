export type User = {
  id: string;
  login: string;
  email: string;
  createdAt: Date;
};

export type EmailConfirmation = {
  code: string;
  expiresAt: Date;
  isConfirmed: boolean;
};

export type UserDb = Omit<User, 'id'> & {
  passwordHash: string;
  emailConfirmation: EmailConfirmation;
};
