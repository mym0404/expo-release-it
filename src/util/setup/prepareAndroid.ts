import { resolve, remove, iterateDir, copy, read, write, relativePath } from '../FileUtil';
import { OptionHolder } from '../OptionHolder';
import { injectTemplatePlaceHolders } from '../injectTemplatePlaceHolders';
import { spinner } from '../spinner';
import { exe, yesShell } from './execShellScript';
import { logger } from '../logger';

export async function prepareAndroid() {
  const srcDir = resolve(OptionHolder.cli.templateDir, 'android');
  const destDir = resolve(OptionHolder.projectDir, 'android');

  await yesShell('expo', ['prebuild', '-p', 'android', '--no-install'], {
    cwd: OptionHolder.projectDir,
  });
  logger.success('Expo Prebuild - Done');

  await spinner(
    'Inject Templates',
    iterateDir(srcDir, async (file) => {
      const filePath = resolve(srcDir, file);
      remove(resolve(destDir, file));
      copy(filePath, resolve(destDir, file));
    }),
  );

  await spinner('Overwrite Android Release Signing Config', replaceAndroidSigningConfig(destDir));

  await spinner(
    'Hydrate template placeholders',
    injectTemplatePlaceHolders(resolve(destDir, 'fastlane')),
  );

  await exe({ cwd: destDir })`bundle install`;
  logger.success('Bunder Install - Done');
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
