import { spinner, $, path } from 'zx';
import { resolve, remove, iterateDir, copy, read, write } from '../FileUtil';
import { OptionHolder } from '../OptionHolder';
import { logger } from '../logger';

export async function prepareAndroid() {
  const androidDir = resolve(OptionHolder.rootDir, 'android');
  const fastlaneSrcDir = resolve(OptionHolder.outDir, 'fastlane-android');
  const fastlaneDestDir = resolve(OptionHolder.rootDir, 'android', 'fastlane');

  await spinner(
    'Prebuild Android',
    () => $`cd ${OptionHolder.rootDir} && expo prebuild -p android --no-install`,
  );

  remove(fastlaneDestDir);

  await iterateDir(fastlaneSrcDir, async (file) => {
    const filePath = resolve(fastlaneSrcDir, file);
    remove(resolve(androidDir, file));
    copy(filePath, resolve(androidDir, file));
  });
  logger.success('Inject Android Fastlane files');
  await replaceAndroidSigningConfig();

  async function replaceAndroidSigningConfig() {
    const buildGradlePath = resolve(androidDir, 'app', 'build.gradle');
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
        storeFile file('${path.relative(buildGradlePath, resolve(OptionHolder.outDir, 'key', 'android_release_keystore.jks'))}')
        storePassword '${android_keystore_store_password}'
        keyAlias '${android_keystore_key_alias}'
        keyPassword '${android_keystore_key_password}'
    }
  }
      `,
    );
    write(buildGradlePath, content);
    logger.success('Replace Android Signing Config');
  }
}
