const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'] as const;
const optionalEnvVars = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'SMTP_FROM',
  'BREVO_API_KEY',
  'BREVO_SENDER_EMAIL',
  'BREVO_SENDER_NAME',
  'GOOGLE_CLIENT_ID',
] as const;

type EnvVar = typeof requiredEnvVars[number];
type OptionalEnvVar = typeof optionalEnvVars[number];

function getEnv(varName: EnvVar): string {
  const value = process.env[varName];
  if (!value) {
    throw new Error(`Variável de ambiente ${varName} não está definida`);
  }
  return value;
}

function getOptionalEnv(varName: OptionalEnvVar): string | undefined {
  const value = process.env[varName];
  return value && value.trim() ? value : undefined;
}

const smtpPortValue = getOptionalEnv('SMTP_PORT');
const smtpPort = smtpPortValue ? Number(smtpPortValue) : undefined;
const smtpHost = getOptionalEnv('SMTP_HOST');
const smtpFrom = getOptionalEnv('SMTP_FROM');
const brevoApiKey = getOptionalEnv('BREVO_API_KEY');
const brevoSenderEmail = getOptionalEnv('BREVO_SENDER_EMAIL');
const brevoSenderName = getOptionalEnv('BREVO_SENDER_NAME');

export const env = {
  jwtSecret: getEnv('JWT_SECRET'),
  databaseUrl: getEnv('DATABASE_URL'),
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  mail: {
    host: smtpHost,
    port: smtpPort,
    user: getOptionalEnv('SMTP_USER'),
    pass: getOptionalEnv('SMTP_PASS'),
    from: smtpFrom,
    enabled: Boolean(smtpHost && smtpFrom),
  },
  brevo: {
    apiKey: brevoApiKey,
    senderEmail: brevoSenderEmail,
    senderName: brevoSenderName,
    enabled: Boolean(brevoApiKey && brevoSenderEmail),
  },
  googleClientId: getOptionalEnv('GOOGLE_CLIENT_ID'),
} as const;
