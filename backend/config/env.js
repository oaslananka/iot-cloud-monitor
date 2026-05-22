const path = require('node:path');

const dotenv = require('dotenv');
const { z } = require('zod');

dotenv.config({ path: path.resolve(process.cwd(), '.env'), quiet: true });

const VALID_LOG_LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'];
const DEFAULT_TEST_SECRET = 'test-jwt-secret-with-at-least-32-bytes';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(0).max(65535).default(3000),
  MONGODB_URI: z.string().trim().optional(),
  JWT_SECRET: z.string().optional(),
  JWT_ISSUER: z.string().trim().optional(),
  JWT_AUDIENCE: z.string().trim().optional(),
  JWT_EXPIRES_IN: z.string().trim().default('1h'),
  CORS_ORIGINS: z.string().trim().optional(),
  LOG_LEVEL: z.enum(VALID_LOG_LEVELS).default('info'),
  BODY_LIMIT: z.string().trim().default('100kb'),
  RATE_LIMIT_WINDOW_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100)
});

function parseCsv(value) {
  return String(value || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function loadEnv(source = process.env) {
  const nodeEnv = source.NODE_ENV || 'development';
  const defaults =
    nodeEnv === 'test'
      ? {
          MONGODB_URI: 'mongodb://127.0.0.1:27017/iot-cloud-monitor-test',
          JWT_SECRET: DEFAULT_TEST_SECRET,
          JWT_ISSUER: 'iot-cloud-monitor-test',
          JWT_AUDIENCE: 'iot-cloud-monitor-api-test',
          CORS_ORIGINS: 'http://127.0.0.1:3000',
          LOG_LEVEL: 'silent'
        }
      : {};

  const parsed = envSchema.safeParse({ ...defaults, ...source, NODE_ENV: nodeEnv });
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    throw new Error(`Invalid environment configuration: ${details.join('; ')}`);
  }

  const env = parsed.data;
  const missing = [];
  for (const key of ['MONGODB_URI', 'JWT_SECRET', 'JWT_ISSUER', 'JWT_AUDIENCE', 'CORS_ORIGINS']) {
    if (!env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (env.NODE_ENV !== 'test' && env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters outside test environments');
  }

  if (env.NODE_ENV !== 'test' && ['secret', 'changeme', 'password'].includes(env.JWT_SECRET)) {
    throw new Error('JWT_SECRET must not use a known weak placeholder');
  }

  const corsOrigins = parseCsv(env.CORS_ORIGINS);
  if (env.NODE_ENV === 'production' && corsOrigins.length === 0) {
    throw new Error('CORS_ORIGINS must include at least one origin in production');
  }

  return {
    nodeEnv: env.NODE_ENV,
    isProduction: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',
    port: env.PORT,
    mongodbUri: env.MONGODB_URI,
    jwt: {
      secret: env.JWT_SECRET,
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
      expiresIn: env.JWT_EXPIRES_IN,
      algorithms: ['HS256']
    },
    cors: {
      origins: corsOrigins
    },
    logLevel: env.LOG_LEVEL,
    bodyLimit: env.BODY_LIMIT,
    rateLimit: {
      enabled: env.NODE_ENV !== 'test',
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX
    }
  };
}

module.exports = { loadEnv };
