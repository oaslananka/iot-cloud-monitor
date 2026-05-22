const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const { loadEnv } = require('../../config/env');

describe('environment loader', () => {
  it('rejects missing required runtime settings outside test', () => {
    assert.throws(
      () =>
        loadEnv({
          NODE_ENV: 'production',
          PORT: '3000',
          LOG_LEVEL: 'info'
        }),
      /Missing required environment variables/
    );
  });

  it('rejects weak JWT secrets outside test', () => {
    assert.throws(
      () =>
        loadEnv({
          NODE_ENV: 'production',
          PORT: '3000',
          MONGODB_URI: 'mongodb://127.0.0.1:27017/iot-cloud-monitor',
          JWT_SECRET: 'secret',
          JWT_ISSUER: 'iot-cloud-monitor',
          JWT_AUDIENCE: 'iot-cloud-monitor-api',
          CORS_ORIGINS: 'https://example.com',
          LOG_LEVEL: 'info'
        }),
      /JWT_SECRET must be at least 32 characters/
    );
  });
});
