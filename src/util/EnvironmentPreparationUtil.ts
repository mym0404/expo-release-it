import { spinner, $ } from 'zx';
import path from 'node:path';
import { OptionHolder } from './OptionHolder';
import { remove } from './FileUtil';

export async function prepareAndroid() {
  await spinner('Prebuild Android', () => $`expo prebuild -p android --no-install`);

  const androidDir = path.resolve(OptionHolder.rootDir, 'android');
  remove(androidDir);

  await iterateDir('fastlane-android', async (file) => {
    const filePath = path.resolve('fastlane-android', file);
    await $`cp -r ${filePath} android/${file}`;
  });
  printSuccess('Inject Android Fastlane files');
  await replaceAndroidSigningConfig();

  async function replaceAndroidSigningConfig() {
    const buildGradlePath = resolve('android', 'app', 'build.gradle');
    const content = read(buildGradlePath).replace(
      /signingConfigs.*?{.*?debug.*?{.*?}.*?}/s,
      `
      signingConfigs {
        debug {
            storeFile file('${resolve(projectRoot, 'key', 'android_release_keystore.jks')}')
            storePassword '{{android_keystore_store_password}}'
            keyAlias '{{android_keystore_key_alias}}'
            keyPassword '{{android_keystore_key_password}}'
        }
      }
      `,
    );
    write(buildGradlePath, content);
    printSuccess('Replace Android Signing Config');
  }
}

export async function prepareIos() {
  await spinner('Prebuild iOS', () => $`expo prebuild -p ios --no-install`);
  await remove('ios/fastlane');
  await iterateDir('fastlane-ios', async (file) => {
    const filePath = path.resolve('fastlane-ios', file);
    await $`rm -rf ios/${file} && cp -r ${filePath} ios/${file}`;
  });
  printSuccess('Inject iOS Fastlane files');
}
