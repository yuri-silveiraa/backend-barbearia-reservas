const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'] as const;

type EnvVar = typeof requiredEnvVars[number];

function getEnv(varName: EnvVar): string {
  const value = process.env[varName];
  if (!value) {
    throw new Error(`Variável de ambiente ${varName} não está definida`);
  }
  return value;
}

export const env = {
  jwtSecret: getEnv('JWT_SECRET'),
  databaseUrl: getEnv('DATABASE_URL'),
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
} as const;
