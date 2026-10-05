# IoT Cloud Monitor Agent Instructions

These instructions apply repository-wide. A nested `AGENTS.md` adds or narrows implementation-specific rules for its subtree; repository-wide security, CI, product-truth, and release constraints remain mandatory.

## Repository scope

This repository currently contains:

- a Node.js 24 + Express backend;
- MongoDB persistence;
- CI, security, and release automation;
- example infrastructure under `infra/examples/**`.

It does not currently provide MQTT ingestion, dashboards, serverless deployment, container publishing, or production deployment automation. Do not document or implement those as if they already exist without an explicit task.

## Nested boundaries

- `backend/AGENTS.md` — API, authentication, ownership, validation, persistence, and error contracts.
- `infra/AGENTS.md` — example-only Terraform/Ansible material.

## Working rules

- Read `README.md`, `SECURITY.md`, and the closest nested `AGENTS.md` before changing behavior.
- Use the pinned Node/pnpm toolchain and frozen lockfile.
- Preserve stable API error envelopes and current authentication/authorization semantics.
- Do not weaken validation, rate limiting, ownership checks, CI, dependency audit, workflow lint, or release preflight to make a change pass.
- Keep runtime secrets outside committed source and examples.
- Treat infrastructure examples as references, not production deployment contracts.
- Keep GitHub Actions least-privilege and pinned to reviewed immutable revisions.

## Validation

Use the repository-owned checks:

```bash
pnpm run format:check
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
pnpm run security
pnpm run workflow:lint
pnpm run release:preflight
```

`pnpm run ci` is the aggregate repository gate.

## Definition of done

A change is ready when the relevant implementation, tests, docs, examples, and exact-head CI agree. Do not claim production deployment readiness from local or example-only infrastructure.
