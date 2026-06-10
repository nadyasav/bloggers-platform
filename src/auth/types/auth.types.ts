export type InvalidTokenDb = {
  token: string;
  expiresAt: Date;
};

export type TokenWithPayload = {
  token: string;
  userId: string;
  expiresAt: Date;
};
