import type { RefreshTokenPayload } from './auth.types';

declare global {
  namespace Express {
    interface Request {
      refreshTokenPayload?: RefreshTokenPayload;
    }
  }
}
