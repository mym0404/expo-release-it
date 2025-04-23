import {OptionHolder, type ProgramOptions} from "../util/OptionHolder";
import {log} from "../util/Log";
import chalk from "chalk";
import * as path from "node:path";
import {formatJson} from "@mj-studio/js-util";
import fs from "fs-extra";

export async function init({options}: { options: ProgramOptions }) {
  constructOptionHolder(options);
  log.dim(formatJson(OptionHolder))
  log.info(`${chalk.inverse('expo-local-build')} get started`);
  log.info(`root directory: ${chalk.bgWhite(OptionHolder.rootDir)}`);

  // OptionHolder.iosBundleIdentifier = await input({message: 'IOS Bundle Identifier', required: true})
  // OptionHolder.androidPackageName = await input({message: 'Android Bundle Identifer'})

  await copyTemplates();
}

function constructOptionHolder(options: ProgramOptions) {
  // merge options
  Object.assign(OptionHolder, options);
  OptionHolder.rootDir = path.resolve(options?.rootDir ?? process.cwd());
}

async function copyTemplates() {
  const dirs = ['fastlane-android', 'fastlane-ios', 'key'];

  for (const dir of dirs) {
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
