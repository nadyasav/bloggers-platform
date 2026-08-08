import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectToDb, client } from '../../src/db/db';
import { usersRepository } from '../../src/users/repositories/users.repository';
import { UserAlreadyExistsError } from '../../src/users/errors/user-already-exists.error';
import { UserDb } from '../../src/users/types/user.types';
import {
  DEFAULT_USER,
  createConfirmedUser,
  clearDb,
} from '../utils/auth-utils';

function makeUser(overrides: Partial<UserDb> = {}): UserDb {
  return {
    login: DEFAULT_USER.login,
    email: DEFAULT_USER.email,
    passwordHash: 'hash',
    createdAt: new Date(),
    emailConfirmation: {
      code: '',
      expiresAt: new Date(),
      isConfirmed: true,
    },
    ...overrides,
  };
}

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

describe('usersRepository.create', () => {
  it('should throw UserAlreadyExistsError for a duplicate login', async () => {
    await createConfirmedUser();

    const createDuplicate = usersRepository.create(
      makeUser({ email: 'other@test.com' }),
    );

    await expect(createDuplicate).rejects.toThrow(UserAlreadyExistsError);
    await expect(createDuplicate).rejects.toMatchObject({
      duplicateField: 'login',
    });
  });
});
