# Testing

The test suite uses Node.js test runner, Supertest, and `mongodb-memory-server`.

```bash
pnpm run test
pnpm run test:unit
pnpm run test:integration
```

`pnpm run ci` runs format, lint, syntax checks, tests, build smoke checks, and dependency audit.

Integration tests start an isolated MongoDB instance. A local MongoDB daemon is not required for tests.
