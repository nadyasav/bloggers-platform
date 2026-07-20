module.exports = {
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  testRegex: '\\.test\\.ts$',
  setupFiles: ['<rootDir>/__tests__/setup/test-setup.ts'],
  testTimeout: 100000,
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      { tsconfig: { rootDir: '.', types: ['jest', 'node'] } },
    ],
  },
};
