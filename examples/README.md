# CNG integration examples

`sdk-57` and `sdk-58` are minimum Expo apps using their SDK's official React Native and React versions. They contain no Router, animations, credentials, or native source directories.

| Example | Expo    | React Native | React  | iOS toolchain                             |
| ------- | ------- | ------------ | ------ | ----------------------------------------- |
| SDK 57  | 57.0.23 | 0.86.3       | 19.2.3 | Xcode 27.0; official scene-support opt-in |
| SDK 58  | 58.0.22 | 0.88.1       | 19.3.0 | Xcode 27.0; scene support included        |

SDK 57.0.23 is the [minimum documented version for Xcode 27 scene support](https://docs.expo.dev/versions/v57.0.0/sdk/build-properties/#pluginconfigtypeios). Its example uses `expo-build-properties` 57.0.22 with `ios.enableSceneSupport: true`. This is app configuration provided by Expo; the CLI does not inject it or patch upstream source. Both iOS CI jobs select Xcode 27.0 on the [`xcode-27` runner](https://github.com/actions/runner-images/blob/main/images/macos/xcode-27-arm64-Readme.md).

Run from the repository root after installing workspace dependencies and preparing [Ruby/Bundler](../docs/src/content/ruby.mdx) and the native platform toolchain:

```sh
pnpm build
pnpm test:ruby
pnpm test:e2e 57 android apk
pnpm test:e2e 57 android aab
pnpm test:e2e 57 ios unsigned
pnpm test:e2e 58 android apk
pnpm test:e2e 58 android aab
pnpm test:e2e 58 ios unsigned
```

Each E2E run packs the CLI, copies the minimum app to a temporary standalone project, installs it with npm, and runs the public CLI command. This also avoids mixing SDK-specific React Native dependencies in a shared native workspace. It generates temporary Android test keys and validates the resulting signing certificate, or validates the unsigned iOS archive. It checks user Gemfiles and the managed lockfile after prebuild and stores successful outputs in `.e2e-artifacts/` before deleting the temporary project.

CI runs these six paths on pull requests and main, using SDK-appropriate JDK/Xcode versions. SDK 52 and newer are supported; these two examples are the CI verification points, not an upper support limit. Real store operations, Apple distribution signing, and IPA export require separate credentials and verification.

The CI toolchain baselines verify CLI integration, not arbitrary Expo/RN/Xcode combinations. Upstream native/compiler incompatibilities are outside this library's scope and must not be patched or treated as successful tests.
