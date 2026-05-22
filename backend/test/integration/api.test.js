const assert = require('node:assert/strict');
const { after, before, beforeEach, describe, it } = require('node:test');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');

const { createApp } = require('../../app');
const { connectDB, disconnectDB } = require('../../config/db');
const { loadEnv } = require('../../config/env');
const Data = require('../../models/Data');
const Device = require('../../models/Device');
const User = require('../../models/User');

describe('iot-cloud-monitor API', () => {
  let app;
  let config;
  let mongod;

  before(async () => {
    mongod = await MongoMemoryServer.create();
    config = loadEnv({
      NODE_ENV: 'test',
      PORT: '0',
      MONGODB_URI: mongod.getUri(),
      JWT_SECRET: 'test-jwt-secret-with-at-least-32-bytes',
      JWT_ISSUER: 'iot-cloud-monitor-test',
      JWT_AUDIENCE: 'iot-cloud-monitor-api-test',
      CORS_ORIGINS: 'http://127.0.0.1:3000',
      LOG_LEVEL: 'silent'
    });
    await connectDB(config.mongodbUri);
    app = createApp(config);
  });

  beforeEach(async () => {
    await Promise.all([Data.deleteMany({}), Device.deleteMany({}), User.deleteMany({})]);
  });

  after(async () => {
    await disconnectDB();
    await mongod.stop();
  });

  async function registerUser(overrides = {}) {
    const payload = {
      name: 'Ada Lovelace',
      email: `ada-${new mongoose.Types.ObjectId()}@example.com`,
      password: 'correct-horse-battery-staple',
      ...overrides
    };

    const response = await request(app).post('/api/users/register').send(payload).expect(201);
    return { payload, response };
  }

  async function login(email, password = 'correct-horse-battery-staple') {
    const response = await request(app)
      .post('/api/users/login')
      .send({ email, password })
      .expect(200);

    return response.body.token;
  }

  async function createAuthenticatedUser(overrides = {}) {
    const { payload } = await registerUser(overrides);
    const token = await login(payload.email, payload.password);
    const user = await User.findOne({ email: payload.email.toLowerCase() });
    return { payload, token, user };
  }

  it('reports liveness and dependency readiness', async () => {
    await request(app)
      .get('/healthz')
      .expect(200)
      .expect(({ body }) => {
        assert.equal(body.status, 'ok');
      });

    await request(app)
      .get('/readyz')
      .expect(200)
      .expect(({ body }) => {
        assert.equal(body.status, 'ready');
        assert.equal(body.mongodb, 'connected');
      });
  });

  it('returns 400 for invalid JSON and 413 for bodies over the configured limit', async () => {
    await request(app)
      .post('/api/users/register')
      .set('Content-Type', 'application/json')
      .send('{"email":')
      .expect(400);

    const smallBodyApp = createApp({ ...config, bodyLimit: '16b' });
    await request(smallBodyApp)
      .post('/api/users/register')
      .send({
        name: 'Body Limit',
        email: 'limit@example.com',
        password: 'correct-horse-battery-staple'
      })
      .expect(413);
  });

  it('registers users with hashed passwords and rejects duplicate emails', async () => {
    const { payload, response } = await registerUser({
      email: 'Owner@Example.com'
    });

    assert.equal(response.body.user.email, 'owner@example.com');
    assert.equal(response.body.user.password, undefined);
    assert.equal(response.body.user.passwordHash, undefined);

    const user = await User.findOne({ email: 'owner@example.com' }).select('+passwordHash');
    assert.ok(user.passwordHash.startsWith('$2'));
    assert.notEqual(user.passwordHash, payload.password);

    await request(app)
      .post('/api/users/register')
      .send({ ...payload, email: 'owner@example.com' })
      .expect(409);
  });

  it('logs in with generic failures for unknown users or wrong passwords', async () => {
    const { payload } = await registerUser();

    await request(app)
      .post('/api/users/login')
      .send({ email: payload.email, password: payload.password })
      .expect(200)
      .expect(({ body }) => {
        assert.equal(body.tokenType, 'Bearer');
        assert.equal(typeof body.token, 'string');
      });

    await request(app)
      .post('/api/users/login')
      .send({ email: payload.email, password: 'wrong-password-value' })
      .expect(401)
      .expect(({ body }) => {
        assert.equal(body.error.message, 'Invalid email or password');
      });

    await request(app)
      .post('/api/users/login')
      .send({ email: 'unknown@example.com', password: payload.password })
      .expect(401)
      .expect(({ body }) => {
        assert.equal(body.error.message, 'Invalid email or password');
      });
  });

  it('requires authentication for device mutations and validates device input', async () => {
    await request(app)
      .post('/api/devices')
      .send({ name: 'Gateway 1', type: 'gateway', location: 'Lab' })
      .expect(401);

    const { token } = await createAuthenticatedUser();

    await request(app)
      .post('/api/devices')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '', type: 'sensor', location: 'Lab' })
      .expect(400);
  });

  it('supports authenticated device CRUD scoped to the owner', async () => {
    const owner = await createAuthenticatedUser({ email: 'owner@example.com' });
    const other = await createAuthenticatedUser({ email: 'other@example.com' });

    const created = await request(app)
      .post('/api/devices')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ name: 'Temperature Node', type: 'sensor', location: 'Warehouse' })
      .expect(201);

    const deviceId = created.body.device.id;

    await request(app)
      .get('/api/devices')
      .set('x-auth-token', owner.token)
      .expect(200)
      .expect(({ body }) => {
        assert.equal(body.devices.length, 1);
        assert.equal(body.devices[0].id, deviceId);
      });

    await request(app)
      .get('/api/devices')
      .set('Authorization', `Bearer ${other.token}`)
      .expect(200)
      .expect(({ body }) => {
        assert.equal(body.devices.length, 0);
      });

    await request(app)
      .get(`/api/devices/${deviceId}`)
      .set('Authorization', `Bearer ${other.token}`)
      .expect(403);

    await request(app)
      .put(`/api/devices/${deviceId}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ status: 'online' })
      .expect(200)
      .expect(({ body }) => {
        assert.equal(body.device.status, 'online');
      });

    await request(app)
      .delete(`/api/devices/${new mongoose.Types.ObjectId()}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .expect(404);

    await request(app)
      .get('/api/devices/not-an-object-id')
      .set('x-auth-token', owner.token)
      .expect(400);
  });

  it('stores numeric telemetry only for devices owned by the authenticated user', async () => {
    const owner = await createAuthenticatedUser({ email: 'telemetry-owner@example.com' });
    const other = await createAuthenticatedUser({ email: 'telemetry-other@example.com' });

    const created = await request(app)
      .post('/api/devices')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ name: 'Humidity Node', type: 'sensor', location: 'Greenhouse' })
      .expect(201);

    const deviceId = created.body.device.id;

    await request(app)
      .post('/api/data')
      .set('Authorization', `Bearer ${other.token}`)
      .send({ deviceId, data: { temperature: 22.5 } })
      .expect(403);

    await request(app)
      .post('/api/data')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ deviceId, data: { temperature: 'warm' } })
      .expect(400);

    await request(app)
      .post('/api/data')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ deviceId, data: { temperature: 22.5, humidity: 45 } })
      .expect(201)
      .expect(({ body }) => {
        assert.equal(body.record.deviceId, deviceId);
        assert.equal(body.record.data.temperature, 22.5);
      });

    await request(app)
      .get(`/api/data/${deviceId}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .expect(200)
      .expect(({ body }) => {
        assert.equal(body.records.length, 1);
        assert.equal(body.records[0].data.humidity, 45);
      });

    await request(app)
      .get(`/api/data/${new mongoose.Types.ObjectId()}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .expect(404);
  });
});
