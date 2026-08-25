jest.mock('../../src/core/services/nodemailer.service', () => ({
  NodemailerService: class {
    sendEmail = jest.fn().mockResolvedValue(undefined);
  },
}));

import request from 'supertest';
import { randomUUID } from 'crypto';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../utils/test-setup-app';
import { connectToDb, client, usersCollection } from '../../src/db/db';
import {
  REFRESH_TOKEN_COOKIE,
  RATE_LIMIT,
} from '../../src/auth/auth.constants';
import {
  DEFAULT_USER,
  createConfirmedUser,
  createUnconfirmedUser,
  login,
  findRefreshTokenCookie,
  getRefreshToken,
  clearDb,
} from '../utils/auth-utils';

const REGISTRATION_USER = {
  login: 'newuser',
  password: 'password123',
  email: 'newuser@test.com',
};

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await connectToDb(mongoServer.getUri());
});

afterAll(async () => {
  await client.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await clearDb();
});

describe('POST /auth/login', () => {
  it('should return 200, an access token and an httpOnly, secure refresh token cookie for valid credentials', async () => {
    await createConfirmedUser();

    const response = await login(DEFAULT_USER.login, DEFAULT_USER.password);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ accessToken: expect.any(String) });
    expect(response.body.accessToken.length).toBeGreaterThan(0);

    const refreshCookie = findRefreshTokenCookie(response);

    expect(refreshCookie).toBeDefined();
    expect(refreshCookie).toMatch(new RegExp(`^${REFRESH_TOKEN_COOKIE}=.+`));
    expect(refreshCookie).toMatch(/HttpOnly/i);
    expect(refreshCookie).toMatch(/Secure/i);
  });

  it('should allow login by email', async () => {
    await createConfirmedUser();

    const response = await login(DEFAULT_USER.email, DEFAULT_USER.password);

    expect(response.status).toBe(200);
  });

  it('should return 401 for wrong password', async () => {
    await createConfirmedUser();

    const response = await login(DEFAULT_USER.login, 'wrongpassword');

    expect(response.status).toBe(401);
  });

  it('should return 401 for a non-existing user', async () => {
    const response = await login('ghost', DEFAULT_USER.password);

    expect(response.status).toBe(401);
  });

  it('should return 401 for an unconfirmed user', async () => {
    await createUnconfirmedUser();

    const response = await login(DEFAULT_USER.login, DEFAULT_USER.password);

    expect(response.status).toBe(401);
  });

  it('should return 400 when required fields are missing', async () => {
    const response = await request(app).post('/auth/login').send({});

    expect(response.status).toBe(400);
    expect(response.body.errorsMessages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'loginOrEmail' }),
        expect.objectContaining({ field: 'password' }),
      ]),
    );
  });

  it('should return 400 when required fields are empty strings', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ loginOrEmail: '', password: '' });

    expect(response.status).toBe(400);
    expect(response.body.errorsMessages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'loginOrEmail' }),
        expect.objectContaining({ field: 'password' }),
      ]),
    );
  });
});

describe('GET /auth/me', () => {
  it('should return 200 and the current user for a valid access token', async () => {
    await createConfirmedUser();
    const loginResponse = await login(
      DEFAULT_USER.login,
      DEFAULT_USER.password,
    );
    const accessToken = loginResponse.body.accessToken;

    const response = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      userId: expect.any(String),
      login: DEFAULT_USER.login,
      email: DEFAULT_USER.email,
    });
  });

  it('should return 401 without an authorization header', async () => {
    const response = await request(app).get('/auth/me');

    expect(response.status).toBe(401);
  });

  it('should return 401 for an invalid access token', async () => {
    const response = await request(app)
      .get('/auth/me')
      .set('Authorization', 'Bearer invalid.access.token');

    expect(response.status).toBe(401);
  });
});

describe('POST /auth/registration', () => {
  it('should return 204 and create an unconfirmed user', async () => {
    const response = await request(app)
      .post('/auth/registration')
      .send(REGISTRATION_USER);

    expect(response.status).toBe(204);

    const created = await usersCollection.findOne({
      login: REGISTRATION_USER.login,
    });
    expect(created).not.toBeNull();
    expect(created!.emailConfirmation.isConfirmed).toBe(false);
  });

  it('should return 400 when required fields are missing', async () => {
    const response = await request(app).post('/auth/registration').send({});

    expect(response.status).toBe(400);
    expect(response.body.errorsMessages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'login' }),
        expect.objectContaining({ field: 'password' }),
        expect.objectContaining({ field: 'email' }),
      ]),
    );
  });

  it('should return 400 for invalid email format', async () => {
    const response = await request(app)
      .post('/auth/registration')
      .send({ ...REGISTRATION_USER, email: 'invalid-email' });

    expect(response.status).toBe(400);
    expect(response.body.errorsMessages[0].field).toBe('email');
  });

  it('should return 400 for a login that is too short', async () => {
    const response = await request(app)
      .post('/auth/registration')
      .send({ ...REGISTRATION_USER, login: 'ab' });

    expect(response.status).toBe(400);
    expect(response.body.errorsMessages[0].field).toBe('login');
  });

  it('should return 400 for a password that is too short', async () => {
    const response = await request(app)
      .post('/auth/registration')
      .send({ ...REGISTRATION_USER, password: '123' });

    expect(response.status).toBe(400);
    expect(response.body.errorsMessages[0].field).toBe('password');
  });

  it('should return 400 when login already exists', async () => {
    await createConfirmedUser({ login: REGISTRATION_USER.login });

    const response = await request(app)
      .post('/auth/registration')
      .send(REGISTRATION_USER);

    expect(response.status).toBe(400);
    expect(response.body.errorsMessages[0].field).toBe('login');
  });

  it('should return 400 when email already exists', async () => {
    await createConfirmedUser({ email: REGISTRATION_USER.email });

    const response = await request(app)
      .post('/auth/registration')
      .send(REGISTRATION_USER);

    expect(response.status).toBe(400);
    expect(response.body.errorsMessages[0].field).toBe('email');
  });
});

describe('POST /auth/registration-confirmation', () => {
  it('should return 204 and confirm the user for a valid code', async () => {
    await request(app).post('/auth/registration').send(REGISTRATION_USER);
    const user = await usersCollection.findOne({
      login: REGISTRATION_USER.login,
    });
    const code = user!.emailConfirmation.code;
    expect(user!.emailConfirmation.isConfirmed).toBe(false);

    const response = await request(app)
      .post('/auth/registration-confirmation')
      .send({ code });

    expect(response.status).toBe(204);

    const userConfirmed = await usersCollection.findOne({
      login: REGISTRATION_USER.login,
    });
    expect(userConfirmed!.emailConfirmation.isConfirmed).toBe(true);
  });

  it('should return 400 for a code that is not a valid UUID', async () => {
    const response = await request(app)
      .post('/auth/registration-confirmation')
      .send({ code: 'invalid-code' });

    expect(response.status).toBe(400);
    expect(response.body.errorsMessages[0].field).toBe('code');
  });

  it('should return 400 for an unknown code', async () => {
    const response = await request(app)
      .post('/auth/registration-confirmation')
      .send({ code: randomUUID() });

    expect(response.status).toBe(400);
    expect(response.body.errorsMessages[0].field).toBe('code');
  });

  it('should return 400 when the code was already applied', async () => {
    await request(app).post('/auth/registration').send(REGISTRATION_USER);
    const user = await usersCollection.findOne({
      login: REGISTRATION_USER.login,
    });
    const code = user!.emailConfirmation.code;
    expect(user!.emailConfirmation.isConfirmed).toBe(false);

    await request(app).post('/auth/registration-confirmation').send({ code });

    const userConfirmed = await usersCollection.findOne({
      login: REGISTRATION_USER.login,
    });
    expect(userConfirmed!.emailConfirmation.isConfirmed).toBe(true);

    const response = await request(app)
      .post('/auth/registration-confirmation')
      .send({ code });

    expect(response.status).toBe(400);
    expect(response.body.errorsMessages[0].field).toBe('code');
  });

  it('should return 400 for an expired code', async () => {
    await request(app).post('/auth/registration').send(REGISTRATION_USER);
    const user = await usersCollection.findOne({
      login: REGISTRATION_USER.login,
    });
    const code = user!.emailConfirmation.code;

    await usersCollection.updateOne(
      { login: REGISTRATION_USER.login },
      { $set: { 'emailConfirmation.expiresAt': new Date(Date.now() - 1000) } },
    );

    const response = await request(app)
      .post('/auth/registration-confirmation')
      .send({ code });

    expect(response.status).toBe(400);
    expect(response.body.errorsMessages[0].field).toBe('code');

    const notConfirmed = await usersCollection.findOne({
      login: REGISTRATION_USER.login,
    });
    expect(notConfirmed!.emailConfirmation.isConfirmed).toBe(false);
  });
});

describe('POST /auth/registration-email-resending', () => {
  it('should return 204 for an existing unconfirmed user', async () => {
    await request(app).post('/auth/registration').send(REGISTRATION_USER);

    const response = await request(app)
      .post('/auth/registration-email-resending')
      .send({ email: REGISTRATION_USER.email });

    expect(response.status).toBe(204);
  });

  it('should return 400 for an already confirmed user', async () => {
    await createConfirmedUser();

    const response = await request(app)
      .post('/auth/registration-email-resending')
      .send({ email: DEFAULT_USER.email });

    expect(response.status).toBe(400);
    expect(response.body.errorsMessages[0].field).toBe('email');
  });

  it('should return 400 for a non-existing email', async () => {
    const response = await request(app)
      .post('/auth/registration-email-resending')
      .send({ email: 'ghost@test.com' });

    expect(response.status).toBe(400);
    expect(response.body.errorsMessages[0].field).toBe('email');
  });

  it('should issue a new code and reject the previous one', async () => {
    await request(app).post('/auth/registration').send(REGISTRATION_USER);
    const user = await usersCollection.findOne({
      login: REGISTRATION_USER.login,
    });
    const prevCode = user!.emailConfirmation.code;

    await request(app)
      .post('/auth/registration-email-resending')
      .send({ email: REGISTRATION_USER.email });

    const updatedUser = await usersCollection.findOne({
      login: REGISTRATION_USER.login,
    });

    const withPrevCode = await request(app)
      .post('/auth/registration-confirmation')
      .send({ code: prevCode });

    expect(withPrevCode.status).toBe(400);

    const withNewCode = await request(app)
      .post('/auth/registration-confirmation')
      .send({ code: updatedUser!.emailConfirmation.code });

    expect(withNewCode.status).toBe(204);
  });
});

describe('POST /auth/refresh-token', () => {
  it('should return 200, a new access token and a new httpOnly, secure refresh token cookie', async () => {
    await createConfirmedUser();
    const loginResponse = await login(
      DEFAULT_USER.login,
      DEFAULT_USER.password,
    );
    const refreshToken = getRefreshToken(loginResponse);

    const response = await request(app)
      .post('/auth/refresh-token')
      .set('Cookie', `${REFRESH_TOKEN_COOKIE}=${refreshToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ accessToken: expect.any(String) });

    const refreshCookie = findRefreshTokenCookie(response);

    expect(refreshCookie).toBeDefined();
    expect(refreshCookie).toContain('HttpOnly');
    expect(refreshCookie).toContain('Secure');
    expect(getRefreshToken(response)).not.toBe(refreshToken);
  });

  it('should return 401 when the same refresh token is used twice', async () => {
    await createConfirmedUser();
    const loginResponse = await login(
      DEFAULT_USER.login,
      DEFAULT_USER.password,
    );
    const cookie = `${REFRESH_TOKEN_COOKIE}=${getRefreshToken(loginResponse)}`;

    const firstResponse = await request(app)
      .post('/auth/refresh-token')
      .set('Cookie', cookie);

    expect(firstResponse.status).toBe(200);

    const secondResponse = await request(app)
      .post('/auth/refresh-token')
      .set('Cookie', cookie);

    expect(secondResponse.status).toBe(401);
  });

  it('should keep the same device and update its lastActiveDate', async () => {
    await createConfirmedUser();
    const loginResponse = await login(
      DEFAULT_USER.login,
      DEFAULT_USER.password,
    );
    const devicesBefore = await request(app)
      .get('/security/devices')
      .set(
        'Cookie',
        `${REFRESH_TOKEN_COOKIE}=${getRefreshToken(loginResponse)}`,
      );

    const refreshResponse = await request(app)
      .post('/auth/refresh-token')
      .set(
        'Cookie',
        `${REFRESH_TOKEN_COOKIE}=${getRefreshToken(loginResponse)}`,
      );

    expect(refreshResponse.status).toBe(200);

    const devicesAfter = await request(app)
      .get('/security/devices')
      .set(
        'Cookie',
        `${REFRESH_TOKEN_COOKIE}=${getRefreshToken(refreshResponse)}`,
      );

    expect(devicesAfter.body).toHaveLength(1);
    expect(devicesAfter.body[0].deviceId).toBe(devicesBefore.body[0].deviceId);
    expect(devicesAfter.body[0].lastActiveDate).not.toBe(
      devicesBefore.body[0].lastActiveDate,
    );
  });

  it('should return 401 without a refresh token cookie', async () => {
    const response = await request(app).post('/auth/refresh-token');

    expect(response.status).toBe(401);
  });

  it('should return 401 for an invalid refresh token', async () => {
    const response = await request(app)
      .post('/auth/refresh-token')
      .set('Cookie', `${REFRESH_TOKEN_COOKIE}=invalid.refresh.token`);

    expect(response.status).toBe(401);
  });
});

describe('POST /auth/logout', () => {
  it('should return 204 and invalidate the session', async () => {
    await createConfirmedUser();
    const loginResponse = await login(
      DEFAULT_USER.login,
      DEFAULT_USER.password,
    );
    const refreshToken = getRefreshToken(loginResponse);
    const cookie = `${REFRESH_TOKEN_COOKIE}=${refreshToken}`;

    const logoutResponse = await request(app)
      .post('/auth/logout')
      .set('Cookie', cookie);

    expect(logoutResponse.status).toBe(204);

    const afterLogout = await request(app)
      .post('/auth/refresh-token')
      .set('Cookie', cookie);

    expect(afterLogout.status).toBe(401);
  });

  it('should return 401 without a refresh token', async () => {
    const response = await request(app).post('/auth/logout');

    expect(response.status).toBe(401);
  });
});

describe('POST /auth/login rate limiting', () => {
  it('should return 429 when the request limit is exceeded', async () => {
    const statuses: number[] = [];

    for (let i = 0; i < RATE_LIMIT.LIMIT + 1; i++) {
      const response = await login('ghost', DEFAULT_USER.password);
      statuses.push(response.status);
    }

    expect(
      statuses.slice(0, RATE_LIMIT.LIMIT).every((status) => status === 401),
    ).toBe(true);
    expect(statuses[RATE_LIMIT.LIMIT]).toBe(429);
  });

  it('should count attempts per endpoint separately', async () => {
    for (let i = 0; i < RATE_LIMIT.LIMIT + 1; i++) {
      await login('ghost', DEFAULT_USER.password);
    }

    const exhausted = await login('ghost', DEFAULT_USER.password);
    expect(exhausted.status).toBe(429);

    const otherEndpoint = await request(app)
      .post('/auth/registration')
      .send(REGISTRATION_USER);

    expect(otherEndpoint.status).not.toBe(429);
    expect(otherEndpoint.status).toBe(204);
  });

  it('should count attempts per ip separately', async () => {
    const loginFromIp = (ip: string) =>
      request(app)
        .post('/auth/login')
        .set('X-Forwarded-For', ip)
        .send({ loginOrEmail: 'ghost', password: DEFAULT_USER.password });

    for (let i = 0; i < RATE_LIMIT.LIMIT + 1; i++) {
      await loginFromIp('192.0.2.1');
    }

    const blockedResponse = await loginFromIp('192.0.2.1');
    expect(blockedResponse.status).toBe(429);

    const allowedResponse = await loginFromIp('192.0.2.2');
    expect(allowedResponse.status).not.toBe(429);
    expect(allowedResponse.status).toBe(401);
  });
});
