import { copy, iterateDir, read, relativePath, remove, resolve, write } from '../FileUtil';
import { injectTemplatePlaceHolders } from '../injectTemplatePlaceHolders';
import { logger } from '../logger';
import { copyAndroidMetadata } from '../MetadataSyncUtil';
import { OptionHolder } from '../OptionHolder';
import { replaceStringIfNotContain } from '../replaceStringIfNotContain';
import { spinner } from '../spinner';
import { exe, yesShell } from './execShellScript';

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

  await exe('bundle', ['install'], { cwd: destDir });
  logger.success('Bunder Install - Done');

  copyAndroidMetadata('native');
}

async function replaceAndroidSigningConfig(destDir: string) {
  const buildGradleDirPath = resolve(destDir, 'app');
  const buildGradlePath = resolve(destDir, 'app', 'build.gradle');
  const {
    android_keystore_store_password,
    android_keystore_key_alias,
    android_keystore_key_password,
  } = OptionHolder.keyholderMap;

  const injectedNewDebugSigningConfig = `
signingConfigs {
    debug {
        storeFile file('${relativePath(buildGradleDirPath, resolve(OptionHolder.resourcesDir, 'key', 'android_release.keystore'))}')
        storePassword '${android_keystore_store_password}'
        keyAlias '${android_keystore_key_alias}'
        keyPassword '${android_keystore_key_password}'
    }
  }
`.trim();

  let content = read(buildGradlePath);

  content = replaceStringIfNotContain(
    content,
    /signingConfigs.*?{.*?debug.*?{.*?}.*?}/s,
    injectedNewDebugSigningConfig,
    false,
  );

  write(buildGradlePath, content);
}
