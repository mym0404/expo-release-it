import { OptionHolder, type ProgramOptions } from '../util/OptionHolder';
import { log } from '../util/Log';
import chalk from 'chalk';
import * as path from 'node:path';
import { formatJson } from '@mj-studio/js-util';
import fs from 'fs-extra';
import { input } from '@inquirer/prompts';
import { iterateAllFilesInGeneratedTemplate } from '../util/FileUtil';

export async function init({ options }: { options: ProgramOptions }) {
  constructOptionHolder(options);
  log.dim(formatJson(OptionHolder));
  log.info(`${chalk.inverse('expo-local-build')} get started`);
  log.info(`root directory: ${chalk.bgWhite(OptionHolder.rootDir)}`);

  await promptInputs();
  await copyTemplates();
  await injectPlaceHolders();
}

function constructOptionHolder(options: ProgramOptions) {
  // merge options
  Object.assign(OptionHolder, options);
  OptionHolder.rootDir = path.resolve(options?.rootDir ?? process.cwd());
}

async function promptInputs() {
  /* ios */
  OptionHolder.iosBundleIdentifier = OptionHolder.templateValuePlaceholderMap.ios_app_identifier =
    await input({
      message: 'IOS Bundle Identifier',
      required: true,
    });

  OptionHolder.templateValuePlaceholderMap.ios_app_store_connect_team_id = await input({
    message: 'IOS App Store Connect Team Id',
  });

  OptionHolder.templateValuePlaceholderMap.ios_developer_team_id = await input({
    message: 'IOS Developer Portal Team Id',
  });

  OptionHolder.templateValuePlaceholderMap.ios_match_git_url = await input({
    message: 'IOS Match Key Storage Github URL',
  });

  OptionHolder.templateValuePlaceholderMap.ios_app_store_connect_api_key_id = await input({
    message: 'IOS App Store Connect Api Key Id',
  });

  OptionHolder.templateValuePlaceholderMap.ios_app_store_connect_api_key_issuer_id = await input({
    message: 'IOS App Store Connect Api Key Issuer Id',
  });

  OptionHolder.templateValuePlaceholderMap.ios_xcode_project_target = await input({
    message: 'IOS Xcode Target Name',
    default: 'app',
  });

  /* android */
  OptionHolder.androidPackageName = OptionHolder.templateValuePlaceholderMap.android_package_name =
    await input({
      message: 'Android Package Name',
    });
}

async function copyTemplates() {
  for (const dir of OptionHolder.templateDirNames) {
    await copyDirRecursively(dir);
  }

  async function copyDirRecursively(dir: string) {
    const sourceDirPath = path.join(OptionHolder.cli.templateDir, dir);
    const destDirPath = path.join(OptionHolder.rootDir, dir);
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
