# Operations

## Current Deployment Status

This repository is staging-ready for local and CI verification. It does not include a production deployment workflow.

## Runtime Configuration

Required environment variables:

- `NODE_ENV`
- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_ISSUER`
- `JWT_AUDIENCE`
- `CORS_ORIGINS`
- `LOG_LEVEL`

Optional environment variables:

- `JWT_EXPIRES_IN`
- `BODY_LIMIT`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX`

## Health Checks

- `GET /healthz` returns process liveness.
- `GET /readyz` returns MongoDB readiness.

## Infrastructure

Example Terraform and Ansible files live under `infra/examples/`. They are references only and are not a production deployment path. Production deployment should use a protected environment, managed MongoDB, and a service manager or container runtime.
