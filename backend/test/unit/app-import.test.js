const assert = require('node:assert/strict');
const { describe, it } = require('node:test');
const mongoose = require('mongoose');

describe('app module', () => {
  it('exports an app factory without opening a MongoDB connection on import', async () => {
    await mongoose.disconnect();

    const { createApp } = require('../../app');

    assert.equal(typeof createApp, 'function');
    assert.equal(mongoose.connection.readyState, 0);
  });
});
