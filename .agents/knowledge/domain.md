# Release Domain

## Domain Glossary

| Term                | Meaning                                                                                                                                                                       |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project root        | The consumer Expo project targeted by the CLI: the current directory in normal execution, or this repository's example app in development mode.                               |
| Resources directory | `<project>/expo-release-it`, the persistent home for release configuration, keys, output artifacts, and store metadata.                                                       |
| Native workspace    | The consumer project's `ios/` or `android/` directory, prepared through Expo prebuild before platform operations.                                                             |
| Keyholder           | `keyholder.json` in the resources directory: identifiers and passwords used by native release automation. Signing and service-account key files live separately under `key/`. |
| Version name        | The semver app version used by the CLI and store workflows.                                                                                                                   |
| Version code        | The shared build identifier represented by iOS `buildNumber` and Android `versionCode`.                                                                                       |
| Store metadata      | Listing text and visual assets persisted under the resources directory and synchronized with native Fastlane workspaces.                                                      |

## Persistent Resources and Native Preparation

Native preparation runs Expo prebuild and replaces the CLI-managed automation templates. Preserve the resources directory as the persistent input/output boundary across native regeneration. `init` retains existing key files rather than overwriting them; metadata synchronization uses resources as the input for native preparation and as the destination for pulled store metadata.

These boundaries are implemented by `src/command/init.ts`, the platform preparation modules under `src/util/setup/`, and `src/util/MetadataSyncUtil.ts`.

## Configuration and Binary Versions

- Configuration-file selection uses the first existing JSON object from the explicit `--config` path, the resources directory, then the project root. It does not merge multiple configuration files. See `src/util/parseConfigFile.ts`.
- Expo configuration is the binary-version source. Dynamic app configs are read as text and must expose parseable `VERSION_NAME` and `VERSION_CODE` constants. For `app.json`, iOS and Android build identifiers must agree; writes preserve the iOS string and Android numeric representations.
- When the existing code matches the version-name encoding (major followed by minor and patch padded to three digits), `bump` recomputes that encoding for the next semver. Otherwise it increments the existing code. Keep parsing and writing consistent across platforms; the contract lives in `src/util/setup/VersionUtil.ts` and `src/command/bump.ts`.

## Upload and Submit Are Separate Operations

| Platform | `upload`                                                                                                       | `submit`                                                                                                          |
| -------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Android  | Uploads the selected AAB or APK to the internal testing track, with optional listing metadata and screenshots. | Promotes the internal track to production without uploading the binary again.                                     |
| iOS      | Uploads the IPA to TestFlight; listing metadata and screenshots are not uploaded by this command.              | Requests App Store review for the app version without uploading a binary, with optional metadata and screenshots. |

Keep the TypeScript command options, Fastlane argument construction, and the platform lanes under `template/` consistent with this separation.
