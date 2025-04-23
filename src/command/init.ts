import {input} from "@inquirer/prompts";
import {OptionHolder, type ProgramOptions} from "../util/OptionHolder";
import {log} from "../util/Log";
import chalk from "chalk";

export async function init({options}: {options: ProgramOptions}) {
  // merge options
  OptionHolder.rootDir = options?.rootDir ?? process.cwd();

  log.info(`${chalk.inverse('expo-local-build')} get started`);
  log.info(`working directory: ${chalk.bgWhite(OptionHolder.rootDir)}`);

  OptionHolder.iosBundleIdentifier = await input({message: 'IOS Bundle Identifier', required: true})
  OptionHolder.androidPackageName = await input({message: 'Android Bundle Identifer'})


}
