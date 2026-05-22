# Development

## Requirements

- Node.js 24.16.x LTS, matching `.node-version`.
- pnpm 11.2 or newer in the 11.x line.
- Docker is optional for running MongoDB locally.

## Setup

```bash
pnpm install
cp .env.example .env
```

Update `.env` with a local MongoDB URI and a random `JWT_SECRET` of at least 32 characters.

## Running Locally

```bash
pnpm run dev
```

The API listens on `PORT` and exposes:

- `GET /healthz`
- `GET /readyz`
- `POST /api/users/register`
- `POST /api/users/login`
- `GET /api/devices`
- `POST /api/devices`
- `GET /api/data/:deviceId`
- `POST /api/data`

Device and telemetry routes require `Authorization: Bearer <token>`.
