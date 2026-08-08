import { webcrypto } from 'crypto';

if (!globalThis.crypto) {
  globalThis.crypto = webcrypto as Crypto;
}

process.env.NODE_ENV = 'test';
process.env.TRUST_PROXY = '1';
process.env.MONGODB_URL = 'mongodb://127.0.0.1:27017';
process.env.ACCESS_TOKEN_SECRET = 'test-access-secret';
process.env.ACCESS_TOKEN_EXPIRES_IN = '15m';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';
process.env.REFRESH_TOKEN_EXPIRES_IN = '7d';
process.env.ADMIN_LOGIN = 'admin';
process.env.ADMIN_PASSWORD = 'qwerty';
process.env.EMAIL_ADDRESS = 'test@test.com';
process.env.EMAIL_PASSWORD = 'test-password';
process.env.EMAIL_HOST = 'smtp.test.com';
process.env.EMAIL_PORT = '465';
process.env.APP_URL = 'https://test.com';
process.env.EMAIL_CONFIRM_EXPIRES_IN_MINS = '30';
