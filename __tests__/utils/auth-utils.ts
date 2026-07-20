import request from 'supertest';
import { app } from './test-setup-app';
import { usersCollection } from '../../src/db/db';
import { bcryptService } from '../../src/core/services/bcrypt.service';
import { REFRESH_TOKEN_COOKIE } from '../../src/auth/auth.constants';
import { config } from '../../src/core/config';
import { randomUUID } from 'crypto';

export const DEFAULT_USER = {
  login: 'testuser',
  password: 'password123',
  email: 'testuser@test.com',
};

async function insertUserToDb(
  overrides: Partial<typeof DEFAULT_USER>,
  isConfirmed: boolean,
) {
  const user = { ...DEFAULT_USER, ...overrides };
  const passwordHash = await bcryptService.generateHash(user.password);

  await usersCollection.insertOne({
    login: user.login,
    email: user.email,
    createdAt: new Date(),
    passwordHash,
    emailConfirmation: {
      code: randomUUID(),
      expiresAt: new Date(
        Date.now() + config.emailConfirmExpiresInMins * 60 * 1000,
      ),
      isConfirmed,
    },
  });

  return user;
}

export function createConfirmedUser(
  overrides: Partial<typeof DEFAULT_USER> = {},
) {
  return insertUserToDb(overrides, true);
}

export function createUnconfirmedUser(
  overrides: Partial<typeof DEFAULT_USER> = {},
) {
  return insertUserToDb(overrides, false);
}

export async function login(loginOrEmail: string, password: string) {
  return request(app).post('/auth/login').send({ loginOrEmail, password });
}

export function findRefreshTokenCookie(
  response: request.Response,
): string | undefined {
  const setCookie = response.headers['set-cookie'] as unknown as string[];
  return setCookie?.find((cookie) =>
    cookie.startsWith(`${REFRESH_TOKEN_COOKIE}=`),
  );
}

export function getRefreshToken(response: request.Response): string {
  const cookie = findRefreshTokenCookie(response);

  if (!cookie) {
    throw new Error('Refresh token cookie not found in response');
  }

  const refreshCookie = cookie.split(';')[0];
  return refreshCookie.slice(refreshCookie.indexOf('=') + 1);
}

export async function clearDb() {
  await request(app).delete('/testing/all-data');
}
