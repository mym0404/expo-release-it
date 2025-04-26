import { resolve, remove, iterateDir, copy, read, write, relativePath } from '../FileUtil';
import { OptionHolder } from '../OptionHolder';
import { logger } from '../logger';
import { injectTemplatePlaceHolders } from '../injectTemplatePlaceHolders';
import { spinner } from '../spinner';
import { S } from './execShellScript';

export async function prepareAndroid() {
  const srcDir = resolve(OptionHolder.cli.templateDir, 'android');
  const destDir = resolve(OptionHolder.projectDir, 'android');

  await spinner(
    'Prebuild Android',
    S`cd ${OptionHolder.projectDir} && expo prebuild -p android --no-install`,
  );
  logger.success('expo prebuild');

  await iterateDir(srcDir, async (file) => {
    const filePath = resolve(srcDir, file);
    remove(resolve(destDir, file));
    copy(filePath, resolve(destDir, file));
  });
  logger.success('Inject Android templates');

  await replaceAndroidSigningConfig(destDir);
  logger.success('Overwrite Android Release Signing Config');

  await injectTemplatePlaceHolders(resolve(destDir, 'fastlane'));
  logger.success('Hydrate template placeholders');
}

async function replaceAndroidSigningConfig(destDir: string) {
  const buildGradleDirPath = resolve(destDir, 'app');
  const buildGradlePath = resolve(destDir, 'app', 'build.gradle');
  const {
    android_keystore_store_password,
    android_keystore_key_alias,
    android_keystore_key_password,
  } = OptionHolder.keyholderMap;

  const content = read(buildGradlePath).replace(
    /signingConfigs.*?{.*?debug.*?{.*?}.*?}/s,
    `
  signingConfigs {
    debug {
        storeFile file('${relativePath(buildGradleDirPath, resolve(OptionHolder.outputOfInitDir, 'key', 'android_release_keystore.jks'))}')
        storePassword '${android_keystore_store_password}'
        keyAlias '${android_keystore_key_alias}'
        keyPassword '${android_keystore_key_password}'
    }
  }
      `,
  );
  write(buildGradlePath, content);
}
