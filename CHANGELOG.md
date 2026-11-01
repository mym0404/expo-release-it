# expo-release-it

## 1.0.2

### Patch Changes

- c101e91: Fix iOS submission metadata and screenshot paths so Fastlane reads files from its workspace.

## 1.0.1

### Patch Changes

- 2662283: Automatically renew expired iOS distribution certificates and refresh mismatched provisioning profiles during signed builds.

  Fix Android metadata and screenshot paths for upload and submit.

## 1.0.0

### Major Changes

- 01b76a8: Require EXPO_RELEASE_IT_ENCRYPTION_KEY from the environment or an env file for every command, including init, bump, and unsigned builds. Missing or too-short keys stop execution before project changes; the CLI never prompts for or generates a replacement key. Existing commands manage encrypted credential storage and temporary decryption automatically, importing legacy plaintext credentials and replacement key files only after key validation.

## 0.7.0

### Minor Changes

- fc1498e: Isolate and pin the Ruby toolchain, validate it before native changes, and support clean Expo CNG builds with SDK 52+.

  Separate store operations from prebuild, add unsigned iOS archives and independent Xcode project/target/scheme discovery, preserve Android debug signing, and verify SDK 57/58 release builds in CI.

## 0.6.6

### Patch Changes

- 7631f92: Automate package versioning, changelogs, and npm publishing from main with Changesets.
