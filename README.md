# iot-cloud-monitor

iot-cloud-monitor is a Node.js 24 + Express API for registering users, managing user-owned IoT devices, and storing numeric telemetry readings in MongoDB.

The repository currently provides a backend REST API, automated tests, CI/security workflows, release-please configuration, and example infrastructure files. It does not currently implement MQTT ingestion, alerts, reporting dashboards, AWS Lambda, API Gateway, DynamoDB, CloudFormation, container publishing, registry publishing, or production deployment automation.

## Runtime Requirements

- Node.js 24.16.x LTS
- pnpm 11.2.x
- MongoDB for local runtime
- No local MongoDB daemon is required for tests

## Setup

```bash
pnpm install
cp .env.example .env
```

Update `.env` before running the API. `JWT_SECRET` must be a random value of at least 32 characters outside tests.

## Environment Variables

| Name                   | Required | Description                              |
| ---------------------- | -------- | ---------------------------------------- |
| `NODE_ENV`             | yes      | `development`, `test`, or `production`.  |
| `PORT`                 | yes      | HTTP port.                               |
| `MONGODB_URI`          | yes      | MongoDB connection string.               |
| `JWT_SECRET`           | yes      | JWT signing secret.                      |
| `JWT_ISSUER`           | yes      | Expected JWT issuer.                     |
| `JWT_AUDIENCE`         | yes      | Expected JWT audience.                   |
| `JWT_EXPIRES_IN`       | no       | Token lifetime, default `1h`.            |
| `CORS_ORIGINS`         | yes      | Comma-separated allowed browser origins. |
| `LOG_LEVEL`            | yes      | Pino log level.                          |
| `BODY_LIMIT`           | no       | JSON body size limit, default `100kb`.   |
| `RATE_LIMIT_WINDOW_MS` | no       | Rate limit window for auth routes.       |
| `RATE_LIMIT_MAX`       | no       | Max auth requests per rate limit window. |

## Run Locally

```bash
pnpm run dev
```

Health endpoints:

```http
GET /healthz
GET /readyz
```

## Authentication

Register:

```http
POST /api/users/register
Content-Type: application/json

{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "password": "correct-horse-battery-staple"
}
```

Login:

```http
POST /api/users/login
Content-Type: application/json

{
  "email": "ada@example.com",
  "password": "correct-horse-battery-staple"
}
```

Use the returned token on private routes:

```http
Authorization: Bearer <token>
```

`x-auth-token` is accepted for compatibility but new clients should use the bearer token header.

## Devices

Create a device:

```http
POST /api/devices
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Temperature Node",
  "type": "sensor",
  "location": "Warehouse"
}
```

List devices:

```http
GET /api/devices
Authorization: Bearer <token>
```

Update a device:

```http
PUT /api/devices/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "online"
}
```

Delete a device:

```http
DELETE /api/devices/:id
Authorization: Bearer <token>
```

## Telemetry

Store numeric telemetry for a device owned by the authenticated user:

```http
POST /api/data
Authorization: Bearer <token>
Content-Type: application/json

{
  "deviceId": "665f2c32f8b2b4a9865ddc10",
  "data": {
    "temperature": 22.5,
    "humidity": 45
  }
}
```

Read telemetry:

```http
GET /api/data/:deviceId
Authorization: Bearer <token>
```

## Verification

```bash
pnpm run format:check
pnpm run lint
pnpm run test
pnpm run build
pnpm run security
pnpm run ci
```

## Security Model

- Passwords are hashed with bcrypt before storage.
- JWTs are verified with issuer, audience, expiration, and HS256 algorithm checks.
- Device and telemetry records are scoped to the authenticated owner.
- Request validation returns stable error envelopes.
- Production error responses do not expose stack traces.
- `.env` files and local secrets are ignored.

## Deployment Status

The project is staging-ready for local and CI verification. Production deployment is not configured. Example Terraform and Ansible files are under `infra/examples/` and should be treated as references, not a complete production path.

## Release Policy

Release automation uses release-please manifest mode and Conventional Commits. The release workflow may create a GitHub Release after a release pull request is merged, then build SBOM/checksum/provenance assets in GitHub Actions.

No npm, PyPI, VS Code Marketplace, Open VSX, container registry, Cloudflare, or production deployment publish workflow is configured.

## License

MIT
