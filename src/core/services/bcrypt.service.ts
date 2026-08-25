import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export class BcryptService {
  async generateHash(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async compareHash(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
