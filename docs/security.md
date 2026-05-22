# Security Notes

## Authentication

Users register with name, email, and password. Passwords are stored only as bcrypt hashes. Login returns a JWT access token.

Tokens are verified with:

- HS256 only.
- Expected issuer.
- Expected audience.
- Expiration enforcement.

`Authorization: Bearer <token>` is the primary authentication mechanism. `x-auth-token` is accepted for compatibility and should be avoided in new clients.

## Authorization

Devices are owned by the authenticated user who created them. Telemetry records are scoped to devices owned by the same user. Cross-user access returns `403`.

## Inputs and Errors

Request bodies and URL parameters are validated with Zod. The API returns stable error envelopes:

```json
{
  "error": {
    "code": "validation_error",
    "message": "Request validation failed"
  }
}
```

Unexpected production errors do not expose stack traces.

## Secrets

Runtime secrets come from environment variables or a protected secret provider. Secret values must not be committed, printed, or placed in workflow logs.
