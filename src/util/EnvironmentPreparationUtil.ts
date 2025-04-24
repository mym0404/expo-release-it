import { spinner, $ } from 'zx';
import { OptionHolder } from './OptionHolder';
import { iterateDir, remove, resolve, copy, read, write } from './FileUtil';
import { logger } from './logger';

export async function prepareAndroid() {
  await spinner('Prebuild Android', () => $`expo prebuild -p android --no-install`);

  const androidDir = resolve(OptionHolder.rootDir, 'android');
  const fastlaneSrcDir = resolve(OptionHolder.rootDir, 'fastlane-android');
  const fastlaneDestDir = resolve(OptionHolder.rootDir, 'android', 'fastlane');

  remove(fastlaneDestDir);

  await iterateDir(fastlaneSrcDir, async (file) => {
    const filePath = resolve(fastlaneSrcDir, file);
    copy(filePath, resolve(androidDir, file));
  });
  logger.info('Inject Android Fastlane files');
  await replaceAndroidSigningConfig();

  async function replaceAndroidSigningConfig() {
    const buildGradlePath = resolve('android', 'app', 'build.gradle');
    const content = read(buildGradlePath).replace(
      /signingConfigs.*?{.*?debug.*?{.*?}.*?}/s,
      `
      signingConfigs {
        debug {
            storeFile file('${resolve(OptionHolder.outDir, 'key', 'android_release_keystore.jks')}')
            storePassword '{{android_keystore_store_password}}'
            keyAlias '{{android_keystore_key_alias}}'
            keyPassword '{{android_keystore_key_password}}'
        }
      }
      `,
    );
    write(buildGradlePath, content);
    logger.info('Replace Android Signing Config');
  }
}

// export async function prepareIos() {
//   await spinner('Prebuild iOS', () => $`expo prebuild -p ios --no-install`);
//   await remove('ios/fastlane');
//   await iterateDir('fastlane-ios', async (file) => {
//     const filePath = resolve('fastlane-ios', file);
//     await $`rm -rf ios/${file} && cp -r ${filePath} ios/${file}`;
//   });
//   printSuccess('Inject iOS Fastlane files');
// }
