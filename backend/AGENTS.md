# Backend Agent Instructions

These instructions apply to `backend/**` and supplement the repository root instructions.

## Trust boundary

The backend accepts untrusted HTTP input and persists user-owned devices and telemetry.

Preserve these invariants:

- JWT validation keeps issuer, audience, expiration, and algorithm checks.
- Device and telemetry access remains scoped to the authenticated owner.
- Request bodies and route parameters are validated before business logic.
- Unexpected production failures do not expose stack traces or internal database details.
- Passwords are stored only as hashes and are never returned in API responses.
- New clients should use the bearer-token path rather than extending legacy compatibility headers.

## Data and authorization

- Do not trust a caller-provided user or owner identifier as authority.
- Resolve ownership from the authenticated principal and persisted relationships.
- Cross-user access must continue to fail rather than leak another user's data.
- Keep telemetry values within the documented numeric/data-shape contract.
- Do not introduce a second persistence path that bypasses the model/service ownership checks.

## Testing

Behavior changes need focused unit or integration coverage, especially for:

- validation failures;
- authentication failures;
- cross-user access;
- persistence errors;
- production-safe error responses.

Run the backend test suite plus the root lint/typecheck/build gates before considering the change ready.
