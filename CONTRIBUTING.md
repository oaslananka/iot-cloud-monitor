# Contributing

## Development Flow

1. Create a feature branch from `main`.
2. Install dependencies with `pnpm install`.
3. Make focused changes with tests.
4. Run `pnpm run ci` before opening a pull request.

## Commit Style

Use Conventional Commits:

- `fix(api): handle invalid device ids`
- `feat(data): add telemetry export`
- `docs(readme): clarify local setup`
- `ci(workflows): add dependency audit`

Release automation uses these commits to determine version bumps.

## Pull Requests

- Keep pull requests focused.
- Include tests for backend behavior changes.
- Do not commit secrets, `.env` files, local notes, caches, build output, or dependency folders.
- Do not weaken security checks or skip tests to make CI pass.
