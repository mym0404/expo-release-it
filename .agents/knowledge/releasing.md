# Package Releases

## Release Intent

Changesets manages the npm package version, independently of the consumer app's binary-version commands. Run `pnpm changeset` with releasable changes and select the semver bump for `expo-release-it`. For changes that do not need an npm release, use `pnpm changeset --empty`.

The published package lives at the repository root. Keep `.` in the pnpm workspace package list so Changesets discovers it. The `docs`, `example-sdk-57`, and `example-sdk-58` packages remain private and excluded from versioning and publishing. The JSON configuration under `.changeset/` controls this scope; release notes come from changeset descriptions.

## Main-Branch Automation

The CI workflow validates pull requests to `main` and pushes to `main`. After its root, Ruby, and native E2E checks pass, `release-plan` selects a Changesets mode and checks whether the triggering commit merged the repository's `changeset-release/main` PR. Versioning and publishing run in separate jobs:

1. `version` uses `changesets/action/version` and `pnpm version-packages` to create or update a release PR. Its diff contains package versions, CHANGELOG, the synchronized lockfile, and consumed changesets. This job cannot publish to npm and does not push version commits to `main`.
2. A maintainer reviews and merges the release PR. CI checks its code and build as usual; only the requirement for a new changeset is skipped for the repository's own `changeset-release/main` branch because versioning consumes changesets.
3. `publish` runs only when the triggering commit merged that release PR from the same repository and no further version operation is pending. It builds and checks the exact triggering commit, then publishes packages and creates tags and GitHub releases. Ordinary feature merges, direct version edits, and manual runs on unrelated commits cannot publish.

Non-empty changesets create or refresh the release PR. Empty-only changesets do not create a release PR or a version bump; they remain until a later version operation consumes them. The workflow serializes main runs and does not cancel an active release.

Enable `Settings > Actions > General > Workflow permissions > Allow GitHub Actions to create and approve pull requests` so the repository token can create release PRs. The workflow does not approve or merge them. With `GITHUB_TOKEN`, automatically created or updated PR checks require a maintainer to select **Approve workflows to run** before they execute. See [GitHub's workflow trigger rules](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow#triggering-a-workflow-from-a-workflow).

The local `pnpm release` entrypoint still builds, checks, and publishes directly with Changesets. The PR approval boundary applies to CI automation. Never use publishing commands as a dry-run verification step.

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

Only the `publish` job grants `id-token: write` for npm OIDC; its `contents: write` permission creates tags and GitHub releases. The `version` job has `contents: write` and `pull-requests: write` to maintain the release PR, without npm credentials. Publishing stays in `ci.yml`, so splitting the jobs does not require changing the registered npm workflow identity. The publish job installs npm 11 explicitly: the pinned pnpm client delegates the final publish to npm, and the Node runtime's bundled npm is too old for trusted publishing. No npm token secret is required.

Register the publisher in npm package settings or, from an authenticated maintainer session, run:

```sh
npm trust github expo-release-it --repository mym0404/expo-release-it --file ci.yml --allow-publish --yes
```

This setup command requires npm 11.15 or newer and maintainer authentication. A workflow filename or environment change must also update the npm trust configuration.

## Verification and Retry

- `pnpm changeset status --since=origin/main` validates release intent without changing versions. Fetch main first when checking a feature branch.
- `pnpm changeset status` reads all pending changesets for the release PR. Do not use `--since=origin/main` here: it filters out changesets already committed to main.
- `pnpm changeset publish-plan` reports unpublished packages without publishing. Only the public root package should appear.
- Exercise `pnpm version-packages` in a temporary checkout when verifying version consumption; it changes tracked versions, lockfile, CHANGELOG, and changeset files.
- Retry a failed publish by rerunning the CI run for the merged release PR commit. A manual dispatch is also eligible if the selected main commit is that merge commit. Checkout remains pinned to the triggering commit, even if main later advances; no second version bump or release PR is needed. Publishing skips versions already on npm, so tag and GitHub release creation can be retried after npm succeeds. A manual dispatch on an unrelated main commit does not publish.
- Validate workflow syntax and the release-mode/merged-PR gates without creating a PR or publishing. Live PR creation and npm OIDC publishing require the workflow on GitHub; local checks do not establish either operation succeeded.
