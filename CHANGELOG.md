# expo-release-it

## 0.7.0

### Minor Changes

- fc1498e: Isolate and pin the Ruby toolchain, validate it before native changes, and support clean Expo CNG builds with SDK 52+.

  Separate store operations from prebuild, add unsigned iOS archives and independent Xcode project/target/scheme discovery, preserve Android debug signing, and verify SDK 57/58 release builds in CI.

## 0.6.6

### Patch Changes

- 7631f92: Automate package versioning, changelogs, and npm publishing from main with Changesets.
