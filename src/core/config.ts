const defaults = {
  PORT: '5001',
  ACCESS_TOKEN_EXPIRES_IN: '15m',
  REFRESH_TOKEN_EXPIRES_IN: '7d',
  EMAIL_CONFIRM_EXPIRES_IN_MINS: '30',
};

const getConfig = () => {
  const missingEnvVars: string[] = [];

  const getEnvVar = (name: string): string => {
    const value = process.env[name];

    if (!value) {
      missingEnvVars.push(name);
    }

    return value || '';
  };

  const result = {
    port: process.env.PORT || defaults.PORT,
    mongodbUrl: getEnvVar('MONGODB_URL'),
    accessTokenSecret: getEnvVar('ACCESS_TOKEN_SECRET'),
    accessTokenExpiresIn:
      process.env.ACCESS_TOKEN_EXPIRES_IN || defaults.ACCESS_TOKEN_EXPIRES_IN,
    refreshTokenSecret: getEnvVar('REFRESH_TOKEN_SECRET'),
    refreshTokenExpiresIn:
      process.env.REFRESH_TOKEN_EXPIRES_IN || defaults.REFRESH_TOKEN_EXPIRES_IN,
    adminLogin: getEnvVar('ADMIN_LOGIN'),
    adminPassword: getEnvVar('ADMIN_PASSWORD'),
    email: {
      address: getEnvVar('EMAIL_ADDRESS'),
      password: getEnvVar('EMAIL_PASSWORD'),
      host: getEnvVar('EMAIL_HOST'),
      port: getEnvVar('EMAIL_PORT'),
    },
    appUrl: getEnvVar('APP_URL'),
    emailConfirmExpiresInMins: Number(
      process.env.EMAIL_CONFIRM_EXPIRES_IN_MINS ||
        defaults.EMAIL_CONFIRM_EXPIRES_IN_MINS,
    ),
  };

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingEnvVars.join(', ')}`,
    );
  }

  return result;
};

export const config = getConfig();
