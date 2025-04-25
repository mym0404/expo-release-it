import { OptionHolder } from '../util/OptionHolder';
import { logger } from '../util/logger';
import chalk from 'chalk';
import { input } from '@inquirer/prompts';
import { iterateAllFilesInGeneratedTemplate } from '../util/iterateAllFilesInGeneratedTemplate';
import { isDev } from '../util/EnvUtil';
import { parseBinaryVersions } from '../util/VersionUtil';
import { promptCommonInputs } from '../util/setup/promptCommonInputs';
import { exist, remove, copy, read, write, join, writeJson } from '../util/FileUtil';
import { path } from 'zx';

export type InitOptions = {};

export async function init({ options }: { options: InitOptions }) {
  Object.assign(OptionHolder.init, options);

  logger.info(`${chalk.inverse('expo-local-build')}`);

  await promptCommonInputs();
  await parseBinaryVersions();
  await promptInputs();
  await copyTemplates();
  await injectPlaceHolders();

  logger.success('expo-local-build init success');
}

async function promptInputs() {
  /* ios */
  OptionHolder.iosBundleIdentifier = OptionHolder.templateValuePlaceholderMap.ios_app_identifier =
    await input({
      message: 'IOS Bundle Identifier',
      required: true,
      default: isDev ? 'ios_app_identifier' : undefined,
    });

  OptionHolder.templateValuePlaceholderMap.ios_app_store_connect_team_id = await input({
    message: 'IOS App Store Connect Team Id',
    default: isDev ? 'ios_app_store_connect_team_id' : undefined,
  });

  OptionHolder.templateValuePlaceholderMap.ios_developer_team_id = await input({
    message: 'IOS Developer Portal Team Id',
    default: isDev ? 'ios_developer_team_id' : undefined,
  });

  OptionHolder.templateValuePlaceholderMap.ios_match_git_url = await input({
    message: 'IOS Match Key Storage Github URL',
    default: isDev ? 'ios_match_git_url' : undefined,
  });

  OptionHolder.keyholderFileValueMap.ios_match_password = await input({
    message: 'IOS Match Password',
    default: isDev ? 'ios_match_password' : undefined,
  });

  OptionHolder.templateValuePlaceholderMap.ios_app_store_connect_api_key_id = await input({
    message: 'IOS App Store Connect Api Key Id',
    default: isDev ? 'ios_app_store_connect_api_key_id' : undefined,
  });

  OptionHolder.templateValuePlaceholderMap.ios_app_store_connect_api_key_issuer_id = await input({
    message: 'IOS App Store Connect Api Key Issuer Id',
    default: isDev ? 'ios_app_store_connect_api_key_issuer_id' : undefined,
  });

  OptionHolder.templateValuePlaceholderMap.ios_xcode_project_target = await input({
    message: 'IOS Xcode Target Name',
    default: 'app',
  });

  /* android */
  OptionHolder.androidPackageName = OptionHolder.templateValuePlaceholderMap.android_package_name =
    await input({
      message: 'Android Package Name',
      default: isDev ? 'android_package_name' : undefined,
    });
  OptionHolder.keyholderFileValueMap.android_keystore_store_password = await input({
    message: 'Android Keystore Store Password',
    default: isDev ? 'android_keystore_store_password' : undefined,
  });
  OptionHolder.keyholderFileValueMap.android_keystore_key_alias = await input({
    message: 'Android Keystore Key Alias',
    default: isDev ? 'android_keystore_key_alias' : undefined,
  });
  OptionHolder.keyholderFileValueMap.android_keystore_key_password = await input({
    message: 'Android Keystore Key Password',
    default: isDev ? 'android_keystore_key_password' : undefined,
  });

  writeJson(OptionHolder.keyholderFilePath, OptionHolder.keyholderFileValueMap);
}

async function copyTemplates() {
  for (const dir of OptionHolder.templateDirNames) {
    await copyDirRecursively(dir);
  }

  async function copyDirRecursively(dir: string) {
    const sourceDirPath = join(OptionHolder.cli.templateDir, dir);
    const destDirPath = join(OptionHolder.outputOfInitDir, dir);
    // don't overwirte key
    if (exist(destDirPath) && dir !== 'key') {
      remove(destDirPath);
    }
    copy(sourceDirPath, destDirPath, { overwrite: dir !== 'key' });
  }
}

async function injectPlaceHolders() {
  await iterateAllFilesInGeneratedTemplate(async (filePath: string) => {
    let content = read(filePath);
    for (const [key, value] of Object.entries(OptionHolder.templateValuePlaceholderMap)) {
      content = content.replaceAll(`{{${key}}}`, value);
    }
    // dynamic replace
    content = content.replaceAll(
      '{{key_dir_relative_path}}',
      path.relative(filePath, OptionHolder.keyDir),
    );
    write(filePath, content);
  });
}
