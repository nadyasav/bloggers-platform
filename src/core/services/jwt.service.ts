import jwt, { Algorithm, JwtPayload, SignOptions } from 'jsonwebtoken';

const ALGORITHM: Algorithm = 'HS256';

export const jwtService = {
  createToken(
    payload: Record<string, unknown>,
    secret: string,
    expiresIn: NonNullable<SignOptions['expiresIn']>,
  ): { token: string; iat: number; exp: number } {
    const token = jwt.sign(payload, secret, {
      expiresIn,
      algorithm: ALGORITHM,
    });
    const decodedToken = jwt.decode(token) as JwtPayload & {
      iat: number;
      exp: number;
    };

    return { token, iat: decodedToken.iat, exp: decodedToken.exp };
  },

  verifyToken(
    token: string,
    secret: string,
  ): (JwtPayload & { iat: number; exp: number }) | null {
    try {
      return jwt.verify(token, secret, {
        algorithms: [ALGORITHM],
      }) as JwtPayload & {
        iat: number;
        exp: number;
      };
    } catch {
      return null;
    }
  },
};
