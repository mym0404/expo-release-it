import { OptionHolder } from '../util/OptionHolder';
import { logger } from '../util/logger';
import chalk from 'chalk';
import { input } from '@inquirer/prompts';
import { isDev } from '../util/EnvUtil';
import { parseBinaryVersions } from '../util/VersionUtil';
import { promptCommonInputs } from '../util/setup/promptCommonInputs';
import { copy, join, writeJson } from '../util/FileUtil';

export type InitOptions = {};

export async function init({ options }: { options: InitOptions }) {
  Object.assign(OptionHolder.init, options);

  logger.info(`${chalk.inverse('expo-local-build')}`);

  await promptCommonInputs();
  await parseBinaryVersions();
  await promptInputs();
  await copyTemplates();

  logger.success('expo-local-build init success');
}

async function promptInputs() {
  /* ios */
  OptionHolder.iosBundleIdentifier = OptionHolder.keyholderMap.ios_app_identifier = await input({
    message: 'IOS Bundle Identifier',
    required: true,
    default: isDev ? 'ios_app_identifier' : undefined,
  });

  OptionHolder.keyholderMap.ios_app_store_connect_team_id = await input({
    message: 'IOS App Store Connect Team Id',
    default: isDev ? 'ios_app_store_connect_team_id' : undefined,
  });

  OptionHolder.keyholderMap.ios_developer_team_id = await input({
    message: 'IOS Developer Portal Team Id',
    default: isDev ? 'ios_developer_team_id' : undefined,
  });

  OptionHolder.keyholderMap.ios_match_git_url = await input({
    message: 'IOS Match Key Storage Github URL',
    default: isDev ? 'ios_match_git_url' : undefined,
  });

  OptionHolder.keyholderMap.ios_match_password = await input({
    message: 'IOS Match Password',
    default: isDev ? 'ios_match_password' : undefined,
  });

  OptionHolder.keyholderMap.ios_app_store_connect_api_key_id = await input({
    message: 'IOS App Store Connect Api Key Id',
    default: isDev ? 'ios_app_store_connect_api_key_id' : undefined,
  });

  OptionHolder.keyholderMap.ios_app_store_connect_api_key_issuer_id = await input({
    message: 'IOS App Store Connect Api Key Issuer Id',
    default: isDev ? 'ios_app_store_connect_api_key_issuer_id' : undefined,
  });

  OptionHolder.keyholderMap.ios_xcode_project_target = await input({
    message: 'IOS Xcode Target Name',
    default: 'app',
  });

  /* android */
  OptionHolder.androidPackageName = OptionHolder.keyholderMap.android_package_name = await input({
    message: 'Android Package Name',
    default: isDev ? 'android_package_name' : undefined,
  });
  OptionHolder.keyholderMap.android_keystore_store_password = await input({
    message: 'Android Keystore Store Password',
    default: isDev ? 'android_keystore_store_password' : undefined,
  });
  OptionHolder.keyholderMap.android_keystore_key_alias = await input({
    message: 'Android Keystore Key Alias',
    default: isDev ? 'android_keystore_key_alias' : undefined,
  });
  OptionHolder.keyholderMap.android_keystore_key_password = await input({
    message: 'Android Keystore Key Password',
    default: isDev ? 'android_keystore_key_password' : undefined,
  });

  writeJson(OptionHolder.keyholderFilePath, OptionHolder.keyholderMap);
}

async function copyTemplates() {
  for (const dir of OptionHolder.templateDirNames) {
    await copyDirRecursively(dir);
  }

  async function copyDirRecursively(dir: string) {
    const sourceDirPath = join(OptionHolder.cli.templateDir, dir);
    const destDirPath = join(OptionHolder.outputOfInitDir, dir);
    // don't overwirte key
    copy(sourceDirPath, destDirPath, { overwrite: dir !== 'key' });
  }
}
