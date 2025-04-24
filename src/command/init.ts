import { OptionHolder } from '../util/OptionHolder';
import { log } from '../util/Log';
import chalk from 'chalk';
import * as path from 'node:path';
import fs from 'fs-extra';
import { input } from '@inquirer/prompts';
import { iterateAllFilesInGeneratedTemplate } from '../util/FileUtil';
import { isDev } from '../util/EnvUtil';
import { parseBinaryVersions } from '../util/VersionUtil';
import { promptCommonInputs } from '../util/promptCommonInputs';

export async function init() {
  log.info(`${chalk.inverse('expo-local-build')}`);

  await promptCommonInputs();
  await parseBinaryVersions();
  await promptInputs();
  await copyTemplates();
  await injectPlaceHolders();
}

async function promptInputs() {
  /* path */
  OptionHolder.outDir = path.join(
    OptionHolder.rootDir,
    await input({
      message: 'output path',
      default: 'expo-local-build',
    }),
  );

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
  OptionHolder.templateValuePlaceholderMap.android_keystore_store_password = await input({
    message: 'Android Keystore Store Password',
    default: isDev ? 'android_keystore_store_password' : undefined,
  });
  OptionHolder.templateValuePlaceholderMap.android_keystore_key_alias = await input({
    message: 'Android Keystore Key Alias',
    default: isDev ? 'android_keystore_key_alias' : undefined,
  });
  OptionHolder.templateValuePlaceholderMap.android_keystore_key_password = await input({
    message: 'Android Keystore Key Password',
    default: isDev ? 'android_keystore_key_password' : undefined,
  });
}

async function copyTemplates() {
  for (const dir of OptionHolder.templateDirNames) {
    await copyDirRecursively(dir);
  }

  async function copyDirRecursively(dir: string) {
    const sourceDirPath = path.join(OptionHolder.cli.templateDir, dir);
    const destDirPath = path.join(OptionHolder.outDir, dir);
    if (fs.existsSync(destDirPath)) {
      await fs.remove(destDirPath);
    }
    await fs.copy(sourceDirPath, destDirPath);
  }
}

async function injectPlaceHolders() {
  await iterateAllFilesInGeneratedTemplate(async (filePath: string) => {
    let content = await fs.readFile(filePath, { encoding: 'utf-8' });
    for (const [key, value] of Object.entries(OptionHolder.templateValuePlaceholderMap)) {
      content = content.replaceAll(`{{${key}}}`, value);
      await fs.writeFile(filePath, content, { encoding: 'utf-8' });
    }
  });
}
