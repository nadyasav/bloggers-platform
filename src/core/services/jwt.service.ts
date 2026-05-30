import jwt, { SignOptions } from 'jsonwebtoken';

export const jwtService = {
  createToken(
    userId: string,
    secret: string,
    expiresIn: SignOptions['expiresIn'],
  ): string {
    return jwt.sign({ userId }, secret, { expiresIn });
  },

  verifyToken(token: string, secret: string): { userId: string } | null {
    try {
      return jwt.verify(token, secret) as { userId: string };
    } catch {
      return null;
    }
  },
};
