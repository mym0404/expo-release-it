# Conditional Verification

## Default Check Limits

The root TypeScript check includes `src` and `package.json`; it does not type-check the documentation workspaces. Vitest covers version helpers, Ruby preflight/selection/isolation, store-command native isolation, Xcode ambiguity, and the temporary Node-path cleanup regression. The minimum examples are JavaScript apps outside the root type check.

`pnpm test:ruby` builds on the compiled CLI modules to install and execute the actual pinned Bundler, Fastlane, and CocoaPods in a disposable project with hostile inherited Bundler settings and user Gemfiles. `pnpm test:e2e <57|58> <android|ios> <apk|aab|unsigned>` packages and installs the CLI in a standalone copy of the corresponding minimum CNG app and invokes its public build command. Android fixtures supply their test keystore/passwords in the legacy format and verify that the normal build command encrypts them automatically and removes plaintext; both platforms supply a test encryption key, including unsigned iOS. The suite checks unchanged user Gemfiles, preserved managed lockfiles, Android test signing certificates, and unsigned iOS archive contents. Successful artifacts are copied to `.e2e-artifacts/` before the temporary project is deleted.

Oxlint checks supported JS/TS files, not MDX rendering. The generated configuration declaration is excluded from lint but remains covered by formatting and the root type check. Generated build, Expo, native, and search output are excluded from lint/format checks; pnpm manages the lockfile without Oxfmt formatting.

CI validates changesets and runs the root check and CLI build; it also checks the Ruby toolchain on macOS/Linux for Ruby 3.3/4.0 and runs two native E2E paths on SDK 58: Android AAB and unsigned iOS. Ruby 3.4, SDK 57 examples, and APK E2E remain available for manual verification. It does not build docs. Pull requests are validated against `origin/main`, so release-affecting changes need a changeset and non-release changes can use an empty changeset. The repository's own `changeset-release/main` PR skips only the new-changeset requirement because versioning consumes the pending files; the remaining checks still run. After main checks pass, separate version and publish jobs follow the release-PR approval boundary documented in `releasing.md`.

## Conditional Checks

| Change                                                          | Command                                   | What it verifies                                                                                                               |
| --------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Docs application, MDX, framework configuration, or dependencies | `pnpm --filter docs build`                | Next.js production compilation and prerendering through Webpack, followed by Pagefind search-index generation via `postbuild`. |
| Minimum CNG examples or native workflow                         | `pnpm test:e2e <sdk> <platform> <output>` | Real release APK/AAB builds or unsigned iOS archives using a packaged CLI.                                                     |
| Configuration schema, when regenerating only its declaration    | `pnpm build:json-schema-type`             | Regenerates and formats the declaration. Review its diff and follow with the root checks.                                      |

The root checks alone do not validate native builds. The native E2E suite does validate CNG generation, Pod installation, compilation, and Android test signing; Apple distribution signing, IPA export, and real store operations remain outside it. Changes to those workflows also require the relevant platform toolchain and integration verification; passing the helper tests does not establish a successful native build or store release.

The authoritative coverage definitions are `package.json`, `lefthook.yml`, the workspace TypeScript configurations, `vite.config.ts`, the Oxc configurations, and `.github/workflows/ci.yml`.
