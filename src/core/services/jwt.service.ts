import jwt, { Algorithm, SignOptions } from 'jsonwebtoken';

const ALGORITHM: Algorithm = 'HS256';

export const jwtService = {
  createToken(
    userId: string,
    secret: string,
    expiresIn: SignOptions['expiresIn'],
  ): string {
    return jwt.sign({ userId }, secret, { expiresIn, algorithm: ALGORITHM });
  },

  verifyToken(token: string, secret: string): { userId: string } | null {
    try {
      return jwt.verify(token, secret, { algorithms: [ALGORITHM] }) as {
        userId: string;
      };
    } catch {
      return null;
    }
  },
};
