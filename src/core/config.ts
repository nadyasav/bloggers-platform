const defaults = {
  PORT: '5001',
  ACCESS_TOKEN_EXPIRES_IN: '1h',
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
    adminLogin: getEnvVar('ADMIN_LOGIN'),
    adminPassword: getEnvVar('ADMIN_PASSWORD'),
  };

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingEnvVars.join(', ')}`,
    );
  }

  return result;
};

export const config = getConfig();
