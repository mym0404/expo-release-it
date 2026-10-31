# Repository Knowledge

## Project Purpose

`expo-release-it` is a CLI for developers who build Expo apps locally and release them through Google Play and App Store Connect. It coordinates initialization, binary versioning, native builds, testing-track uploads, review submission, and store metadata synchronization.

## Tech Stack

- TypeScript ESM on Node.js, managed as a pnpm workspace. Runtime and package-manager versions are defined by `.nvmrc` and the root `package.json`.
- Native automation uses Expo prebuild, Ruby/Bundler and Fastlane, with Gradle for Android and Xcode for iOS.
- The documentation site uses Next.js, Nextra, React, Tailwind CSS, and Pagefind. The example app uses Expo and React Native; their dependencies use separate `web` and `native` catalogs.
- tsdown builds the CLI; Vitest, TypeScript, Oxlint, Oxfmt, and Lefthook provide local checks. Changesets manages package releases.

## Project Tree

| Location               | Responsibility                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------ |
| `bin/`, `src/index.ts` | Published executable and CLI command registration.                                                     |
| `src/command/`         | User-facing release workflows.                                                                         |
| `src/util/`            | Project setup, configuration, credentials, versions, native preparation, and metadata synchronization. |
| `template/`            | Platform automation and key templates shipped with the CLI.                                            |
| `docs/`                | Documentation application and MDX content.                                                             |
| `example/`             | Consumer Expo app used by CLI development mode.                                                        |

## Verification

- `pnpm run t` runs Lefthook's `check`: repository lint and format checks, Vitest, and the root TypeScript check. Git pre-commit runs the same checks; commit-msg validates Conventional Commits.
- `pnpm build` builds the CLI package, not the workspaces. It generates `src/type/ExpoReleaseItConfiguration.d.ts` from `expo-release-it.schema.json`, formats it, and emits ESM and declarations. Change the schema rather than editing the generated declaration.

## Knowledge System

Root `AGENTS.md` is the default fact owner and the only router. Each fact has one owner; each document below owns only its assigned subject. Read the relevant owner before changing that subject, and read a troubleshooting record before diagnosing its failure or changing its guarded integration.

.agents/knowledge/domain.md

Owns the domain glossary, persistent resource boundaries, configuration-file selection, binary version contracts, and platform release semantics.

.agents/knowledge/verification.md

Owns conditional workspace checks and the coverage limits of the default checks and CI.

.agents/knowledge/releasing.md

Owns package release intent, main-branch automation, npm trusted-publisher setup, and release retries. Read it before changing the release workflow or package discovery.

.agents/troubleshooting/nextra-layout-props-validation.md

Owns the Nextra layout validation patch decision and the evidence required to remove it. Read it before changing the patched dependency or investigating its validation failure.
