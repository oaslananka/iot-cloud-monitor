# Release Process

Release automation is configured with release-please in manifest mode.

## Version Source

Versions are derived from Conventional Commit history:

- `fix:` creates a patch release.
- `feat:` creates a minor release.
- Breaking changes create a major release.

Manual version inputs are not used.

## GitHub Releases

The release workflow runs on pushes to `main`. Release assets are built only after release-please reports that a release was created.

Release assets are generated in GitHub Actions and may include:

- Source archive.
- SBOM.
- SHA256 checksums.
- Artifact attestations where supported by GitHub Actions.

No package registry, container registry, marketplace, or production deploy publish path is configured.
