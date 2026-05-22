const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const { formatDate } = require('../../utils/helpers');

describe('formatDate', () => {
  it('formats a Date as UTC seconds without milliseconds', () => {
    const date = new Date('2024-01-01T00:00:00.000Z');

    assert.equal(formatDate(date), '2024-01-01 00:00:00');
  });
});
