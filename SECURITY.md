# Security Policy

## Supported Versions

Security fixes are targeted at the default branch and the latest GitHub Release once releases are enabled.

## Reporting a Vulnerability

Report vulnerabilities privately through GitHub security advisories when available. If advisories are not enabled, contact the repository owner directly and avoid public issue disclosure until the issue is triaged.

Do not include secret values, access tokens, private keys, production data, or exploit payloads beyond the minimum detail needed to reproduce the issue.

## Security Baseline

- Authentication uses signed JWT bearer tokens with issuer, audience, algorithm, and expiration checks.
- Passwords are hashed before storage and are not returned by default.
- Device and telemetry routes require authentication and enforce per-user ownership.
- Runtime secrets are read from environment variables. `.env` files are ignored; use `.env.example` only for safe placeholders.
- Pull request workflows must not require Doppler or registry secrets.
