# Package Releases

## Release Intent

Changesets manages the npm package version, independently of the consumer app's binary-version commands. Run `pnpm changeset` with releasable changes and select the semver bump for `expo-release-it`. For changes that do not need an npm release, use `pnpm changeset --empty`.

The published package lives at the repository root. Keep `.` in the pnpm workspace package list so Changesets discovers it. The `docs` and `example` packages remain private and excluded from versioning and publishing. The JSON configuration under `.changeset/` controls this scope; release notes come from changeset descriptions.

## Main-Branch Automation

The CI workflow validates pull requests to `main` and pushes to `main`. After its checks pass, a main-branch release job:

1. Checks out the triggering commit, verifies main has not advanced, and creates a local main ref for Changesets before reading pending changesets. If any exist, `pnpm version-packages` consumes them, updates versions and CHANGELOG, and synchronizes the pnpm lockfile.
2. Builds and checks the resulting release, then pushes the version commit to main before publishing. Pushes are not forced; a concurrent branch update fails this step before a package is published.
3. Publishes versions absent from npm, creates Changesets tags, pushes tags, and creates the corresponding GitHub release.

There is no intermediate release PR. A push with no changesets does not invent a version bump; publication can still retry an existing unpublished version. Empty changesets are consumed without releasing a new version. The workflow serializes main runs and does not cancel an active release.

The local `pnpm release` entrypoint builds, checks, and publishes with Changesets. CI invokes publishing after its explicit build/check steps. Never use publishing commands as a dry-run verification step.

## npm Trusted Publisher

The npm package owner must register this GitHub Actions identity with permission to publish directly:

| Field             | Value                                                           |
| ----------------- | --------------------------------------------------------------- |
| Package           | `expo-release-it`                                               |
| GitHub owner      | `mym0404`                                                       |
| Repository        | `expo-release-it`                                               |
| Workflow filename | `ci.yml`                                                        |
| Environment       | Leave unset; the workflow does not select a GitHub environment. |
| Allowed action    | `npm publish`                                                   |

The release job grants `id-token: write` for npm OIDC and `contents: write` for version commits, tags, and GitHub releases. It installs npm 11 explicitly: the pinned pnpm client delegates the final publish to npm, and the Node runtime's bundled npm is too old for trusted publishing. No npm token secret is required.

Register the publisher in npm package settings or, from an authenticated maintainer session, run:

```sh
npm trust github expo-release-it --repository mym0404/expo-release-it --file ci.yml --allow-publish --yes
```

This setup command requires npm 11.15 or newer and maintainer authentication. A workflow filename or environment change must also update the npm trust configuration.

## Verification and Retry

- `pnpm changeset status --since=origin/main` validates release intent without changing versions. Fetch main first when checking a feature branch.
- `pnpm changeset status` reads all pending changesets for a main-branch release. Do not use `--since=origin/main` here: it filters out changesets already committed to main.
- `pnpm changeset publish-plan` reports unpublished packages without publishing. Only the public root package should appear.
- Exercise `pnpm version-packages` in a temporary checkout when verifying version consumption; it changes tracked versions, lockfile, CHANGELOG, and changeset files.
- Use the CI workflow's manual dispatch on main to retry publication after a version commit. Rerunning the original run fails its freshness check once main has advanced. No second bump is needed; publishing skips versions already on npm, and tag/release creation can complete afterward.
