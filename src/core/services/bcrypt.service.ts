import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const bcryptService = {
  async generateHash(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  },

  async compareHash(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },
};
