# Package Releases

## Release Intent

Changesets manages the npm package version, independently of the consumer app's binary-version commands. Run `pnpm changeset` with releasable changes and select the semver bump for `expo-release-it`. For changes that do not need an npm release, use `pnpm changeset --empty`.

The published package lives at the repository root. Keep `.` in the pnpm workspace package list so Changesets discovers it. The `docs`, `example-sdk-57`, and `example-sdk-58` packages remain private and excluded from versioning and publishing. The JSON configuration under `.changeset/` controls this scope; release notes come from changeset descriptions.

## Main-Branch Automation

After the CI workflow's root, Ruby, and native E2E checks pass on `main`, the release job selects the Changesets mode. When a version is pending, it runs `pnpm version-packages`, builds and checks the resulting files, commits the version and changelog changes directly to `main`, and publishes that exact commit to npm. It then creates the matching Git tag and GitHub release. No version PR is created. Empty-only changesets do not cause a version bump. Main runs are serialized and active runs are not canceled.

A push that races a newer main commit fails instead of releasing untested changes; rerun the workflow on current main. The local `pnpm release` entrypoint still builds, checks, and publishes directly with Changesets. Never use publishing commands as a dry-run verification step.

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

The `release` job has `contents: write` for the version commit, tag, and GitHub release, and `id-token: write` for npm OIDC. It installs npm 11 and invokes it directly for trusted publishing. No npm token secret is required.

Register the publisher in npm package settings or, from an authenticated maintainer session, run:

```sh
npm trust github expo-release-it --repository mym0404/expo-release-it --file ci.yml --allow-publish --yes
```

This setup command requires npm 11.15 or newer and maintainer authentication. A workflow filename or environment change must also update the npm trust configuration.

## Verification and Retry

- `pnpm changeset status --since=origin/main` validates release intent without changing versions. Fetch main first when checking a feature branch.
- `pnpm changeset status` reads all pending changesets; `pnpm changeset publish-plan` reports unpublished packages without publishing.
- Exercise `pnpm version-packages` in a temporary checkout when verifying version consumption; it changes tracked versions, lockfile, CHANGELOG, and changeset files.
- Retry a failed publish by dispatching the current main workflow. With no pending version operation it locates the latest bot version commit whose package version matches main, checks out that exact commit, and retries publication and tag/release creation. Already published versions are not published twice. A pending version operation takes priority.
- Validate workflow syntax and release gates without publishing. Live npm OIDC publishing and direct version commits require the workflow on GitHub; local checks do not establish either operation succeeded.
