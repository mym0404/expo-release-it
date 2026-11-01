# Release Domain

## Domain Glossary

| Term                | Meaning                                                                                                                                                              |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project root        | The consumer Expo project targeted by the CLI: the current directory in normal execution, or this repository's example app in development mode.                      |
| Resources directory | `<project>/expo-release-it`, the persistent home for release configuration, keys, output artifacts, and store metadata.                                              |
| Native workspace    | The consumer project's `ios/` or `android/` directory, regenerated through clean Expo prebuild only by `build`.                                                      |
| Credentials         | Identifiers, passwords, and key files encrypted together in `credentials.enc.json` in the resources directory. `keyholder.json` and `key/` are legacy/import inputs. |
| Version name        | The semver app version used by the CLI and store workflows.                                                                                                          |
| Version code        | The shared build identifier represented by iOS `buildNumber` and Android `versionCode`.                                                                              |
| Store metadata      | Listing text and visual assets persisted under the resources directory and synchronized with native Fastlane workspaces.                                             |

## Persistent Resources and Native Preparation

The CLI owns Ruby dependency selection, integration with Expo-generated project structures, CNG preparation, signing configuration, artifact handling, and store orchestration. Expo/React Native/native dependency bugs and incompatible SDK/compiler combinations are outside its support boundary. Never patch Pods source, node_modules, compiler internals, or upstream native libraries to make such combinations compile. Report upstream failures and require a toolchain supported by the project; do not suppress native failures or silently switch SDK/Xcode versions. CI verifies the CLI integration at its explicitly configured SDK/toolchain baselines.

Only `build` runs project-local Expo prebuild with `--clean --no-install` for the selected platform. CNG is the sole supported workflow, with SDK 52 and newer and each SDK's official React Native pairing; there is no upper SDK version gate. Native customizations belong in Expo config/config plugins. iOS always installs Pods and removes `.xcode.env.local` afterward to avoid stale temporary Node paths.

`<resources>/.ruby` owns the tool Gemfile/lockfile, private gem installations, and platform Fastlane workspaces. Ruby/Bundler preflight precedes dependency installation, template writes, and native regeneration. `RubyEnvironment.ts` selects a specific Bundler from the packaged lockfile using the inspected Ruby, ignoring inherited Bundler configuration. The consumer's Gemfiles and global settings are not modified. Only iOS builds install the CocoaPods group.

Store commands prepare this persistent Fastlane workspace and do not generate or mutate native projects. Metadata synchronization copies between that workspace and persistent `metadata/`. Encrypted credentials and output artifacts remain in resources.

Credential encryption is the default and stays inside the existing commands; there are no separate encrypt/decrypt commands. `CredentialVault.ts` owns the AES-256-GCM/scrypt format, key selection, legacy detection/import, and runtime plaintext lifecycle. Every workflow command requires `EXPO_RELEASE_IT_ENCRYPTION_KEY` from the process environment first, then `--env-file` or project `.env`. Common setup validates the key before project configuration reads, Git checks, migration, or other work. A missing/short key exits without prompting, generating a replacement key, or changing files. `init` imports legacy values as prompt defaults after key validation. Signed builds and store commands automatically import legacy credentials or replacement key files only with the provided key, warning about plaintext and verifying the encrypted result before deleting imported sources, including the old `.temp/app_store_connect_api.json`. `bump` and unsigned iOS builds also require the encryption key but only warn about legacy files without loading or migrating store/signing credentials.

Key files needed by native tools are materialized under an OS temp directory with owner-only permissions and removed on completion, failure, exit, and handled SIGINT/SIGTERM. SIGKILL or machine failure can leave plaintext temporary files. Child processes receive an empty encryption-key variable; signing passwords still travel through the native tools' environment. Known secrets are registered for log redaction. Encryption never rewrites Git history or removes already tracked files from the index.

Android release signing uses a separate generated Gradle script with environment-provided keys; generated debug signing is preserved. iOS project, application target, and scheme are discovered independently, with explicit configuration required for ambiguous choices. `build --no-sign` skips Apple authentication/signing/export and produces an unsigned archive rather than an IPA.

These boundaries are implemented by `src/command/init.ts`, the preparation modules under `src/util/setup/`, `src/util/MetadataSyncUtil.ts`, and the packaged templates.

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
