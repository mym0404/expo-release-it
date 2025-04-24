import { spinner, $ } from 'zx';
import { resolve, remove, iterateDir, copy, read, write } from './FileUtil';
import { OptionHolder } from './OptionHolder';
import { logger } from './logger';

export async function prepareAndroid() {
  await spinner(
    'Prebuild Android',
    () => $`cd ${OptionHolder.rootDir} && expo prebuild -p android --no-install`,
  );

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
    const {
      android_keystore_store_password,
      android_keystore_key_alias,
      android_keystore_key_password,
    } = OptionHolder.keyholderFileValueMap;

    const content = read(buildGradlePath).replace(
      /signingConfigs.*?{.*?debug.*?{.*?}.*?}/s,
      `
      signingConfigs {
        debug {
            storeFile file('${resolve(OptionHolder.outDir, 'key', 'android_release_keystore.jks')}')
            storePassword '${android_keystore_store_password}'
            keyAlias '${android_keystore_key_alias}'
            keyPassword '${android_keystore_key_password}'
        }
      }
      `,
    );
    write(buildGradlePath, content);
    logger.info('Replace Android Signing Config');
  }
}
