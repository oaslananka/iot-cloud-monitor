const assert = require('node:assert/strict');
const { describe, it } = require('node:test');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const { loadEnv } = require('../../config/env');
const { signAccessToken, verifyAccessToken } = require('../../services/authService');

const config = loadEnv({
  NODE_ENV: 'test',
  MONGODB_URI: 'mongodb://127.0.0.1:27017/iot-cloud-monitor-test',
  JWT_SECRET: 'test-jwt-secret-with-at-least-32-bytes',
  JWT_ISSUER: 'iot-cloud-monitor-test',
  JWT_AUDIENCE: 'iot-cloud-monitor-api-test',
  CORS_ORIGINS: 'http://127.0.0.1:3000',
  LOG_LEVEL: 'silent'
});

describe('auth service', () => {
  it('signs and verifies an HS256 access token with issuer and audience claims', () => {
    const userId = new mongoose.Types.ObjectId();
    const token = signAccessToken({ _id: userId }, config);

    const decoded = verifyAccessToken(token, config);

    assert.equal(decoded.sub, userId.toString());
    assert.equal(decoded.iss, config.jwt.issuer);
    assert.equal(decoded.aud, config.jwt.audience);
  });

  it('rejects tokens signed for a different issuer', () => {
    const token = jwt.sign({ sub: new mongoose.Types.ObjectId().toString() }, config.jwt.secret, {
      algorithm: 'HS256',
      audience: config.jwt.audience,
      issuer: 'unexpected-issuer',
      expiresIn: '1h'
    });

    assert.throws(() => verifyAccessToken(token, config), /jwt issuer invalid/);
  });

  it('rejects tokens signed with an unexpected algorithm', () => {
    const token = jwt.sign({ sub: new mongoose.Types.ObjectId().toString() }, config.jwt.secret, {
      algorithm: 'HS384',
      audience: config.jwt.audience,
      issuer: config.jwt.issuer,
      expiresIn: '1h'
    });

    assert.throws(() => verifyAccessToken(token, config), /invalid algorithm/);
  });
});
