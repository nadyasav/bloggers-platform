declare namespace Express {
  interface Request {
    userId?: string;
    refreshToken?: { token: string; userId: string; expiresAt: Date };
  }
}
