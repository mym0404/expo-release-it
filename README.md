# Expo Release It ⚡️

![expo-release-it thumbnail](./asset/social-image.png)

Opinionated Expo CICD workflow CLI for building & uploading & submitting Expo projects on your machine

> [!CAUTION]
> This project is under development.

# Features

- 🎉 No **EAS**
- 🩵 No headaches when understanding and managing **keys and credentials**
- 🧩 Manage and sync **store metadata** easily
- 🌍 Works with [Expo CNG](https://docs.expo.dev/workflow/continuous-native-generation/) mode (also available in non-CNG environments)
- 📦 Build artifacts **locally** (`apk`, `aab`, `ipa`)
- 🚀 Upload artifacts to Google Play Console Internal Testing Track and iOS TestFlight
- ✅ Submit releases for review

# Why?

**You don't need Expo EAS and to understand how it works in most small projects and our machine is much faster than using the cloud.**

<details>
  <summary>Full Details</summary>

Expo EAS is convenient, but it requires additional configuration files, console setup, and a conceptual understanding of Over-The-Air (OTA) updates. Also, builds must be performed on EAS Cloud, which is not free and can be slow.

While EAS is useful for larger teams, if you are developing alone or with just a few people and question the need for such a process, `expo-release-it` is the answer.

Based on years of experience developing with React Native, I encourage a more traditional approach: build APK, AAB, and IPA files locally, upload them to each platform’s store testing track, and request reviews—without worrying about binary versions, OTA update versions, or branch management.

This approach is much faster, simpler, and, most importantly, allows you to take full advantage of your computer’s fast CPU.

`expo-release-it` is a CLI tool that encapsulates the know-how I have gained over years of automating build and review processes.  
Internally, it ports and integrates tools like Fastlane and Match to automate native binary builds and review requests.

Therefore, this tool enforces an opinionated versioning, build, and review request workflow.  
However, once you understand this approach, your app deployment process will become significantly faster.

</details>

# Structurual Requirements

- Match iOS, Android Binary build version like `1.0.0`. These will be bumped with `bump` command with same manner.
- All Keys, Credentials(except iOS certificates & provisioning profiles served in github separately) are stored in VCS

# Getting Started

## 1. Ruby, Bundler

`expo-release-it` requires `bundler` of ruby is available in your environment to run `Fastlane` internally.

If not, set up your environment so that `ruby` and `bundler` are available by following [Ruby Install Guide](https://www.ruby-lang.org/en/downloads/) 

## 2. Prepare Keys & Credentials

`init` command generates sample key files in `expo-release-it/key`.

> [!IMPORTANT]
You must prepare all required key files in `expo-release-it/key` exactly the same filenames.

### 2-1 `android_play_console_service_account.json`

Google Play Console actions require authentication using Google Service Account.

You can issue new Google Play Service Account by following Guide
and prepare `json` file.

- [How to Get Your Google Play JSON Key](https://help.radio.co/en/articles/6232140-how-to-get-your-google-play-json-key)

### 2-2 `android_release.keystore`

Prepare your android release keystore file for **uploading** and **signing** Android build artifacts.

Additional passwords, alias will be prompted during the `init` command.

- [Keystore generation with Android Studio](https://developer.android.com/studio/publish/app-signing.html#generate-key)
- [Keystore generation with CLI](https://gist.github.com/henriquemenezes/70feb8fff20a19a65346e48786bedb8f)

### 2-3 `ios_app_store_connect_api_key`

App Store Connect actions require authentication using App Store Connect Api Key(.p8) 


## 3. Prepare apps on the stores

Create and configure your application in Google Play Console & App Store Connect as many as possible.

You'd have to fill your key & credentials information using `init` command and pull store metadatas using `pull` command later.

# Usage

```shell
npx expo-release-it (init|bump|pull|build|upload|submit) [options]
```

All commands are powered by [Commander.js](https://github.com/tj/commander.js?) means you can query all available options with `--help` or `-h`.

## init

**Configure resources and environment**

```shell
npx expo-release-it init
```

The `init` command asks you for many form fields, and the information is saved in `expo-release-it/keyholder.json` in your project.

Even after running `init`, you can manually edit `keyholder.json`, and all subsequent commands will use the updated values.

## bump

## pull

## build

## upload

## submit

# Limitation

# Troubleshooting

# Licenses

- See [LICENSE](/LICENSE)

---

<p align="center">
  <a href="https://mjstudio.net/">
    <img width="75px" src="https://raw.githubusercontent.com/mym0404/image-archive/master/202404201239152.webp">
  </a>
  <p align="center">
    Built and maintained by <a href="https://mjstudio.net/">MJ Studio</a>.
  </p>
</p>
