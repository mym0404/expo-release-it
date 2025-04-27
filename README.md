# Expo Release It ⚡️

![expo-release-it thumbnail](./asset/social-image.png)

Opinioned Expo CICD workflow CLI for building & uploading & submitting Expo CNG project on your machine

> [!CAUTION]
> This project is under developing.

# Features

- No EAS
- Manage Keys, Credentials, Metadatas in a simple way 
- Working with CNG mode (also available with non CNG environment)
- Build artifacts locally (`apk`, `aab`, `ipa`)
- Upload artifacts to Google Play Console Internal Testing Track & iOS Testflight
- Submit releases for review

# Why?

Expo EAS is convenient, but it requires additional configuration files, console setup, and a conceptual understanding of Over-The-Air (OTA) updates. Also, builds must be performed on EAS Cloud, which is not free and can be slow.

While EAS is useful for larger teams, if you are developing alone or with just a few people and question the need for such a process, `expo-release-it` is the answer.

Based on years of experience developing with React Native, I encourage a more traditional approach: build APK, AAB, and IPA files locally, upload them to each platform’s store testing track, and request reviews—without worrying about binary versions, OTA update versions, or branch management.

This approach is much faster, simpler, and, most importantly, allows you to take full advantage of your computer’s fast CPU.

`expo-release-it` is a CLI tool that encapsulates the know-how I have gained over years of automating build and review processes.  
Internally, it ports and integrates tools like Fastlane and Match to automate native binary builds and review requests.

Therefore, this tool enforces an opinionated versioning, build, and review request workflow.  
However, once you understand this approach, your app deployment process will become significantly faster.


# Requirements

- Match iOS, Android Binary build version like `1.0.0`
- All Keys, Credentials(except iOS certificates & provisioning profiles) are stored in VCS

# Getting Started



# Usage

```shell
npx expo-release-it (init|bump|build|upload|submit) [options]
```

## init

## bump

## pull

## build

## upload

## submit

# Limitation


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
