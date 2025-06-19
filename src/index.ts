import { Command, Option } from 'commander';

import { ExecaError } from 'execa';
import { build } from './command/build';
import { bump } from './command/bump';
import { init } from './command/init';
import { pull } from './command/pull';
import { submit } from './command/submit';
import { upload } from './command/upload';
import { logger } from './util/logger';
import { OptionHolder } from './util/OptionHolder';
import { throwError } from './util/throwError';

const platformOption = new Option('-p --platform <platform>', 'Platform').choices([
  'android',
  'ios',
]);
const androidBuildOutputOption = new Option(
  '--androidOutput <output>',
  'Android Build Output',
).choices(['aab', 'apk']);
const configFileOption = new Option('--config <filePath>', 'expo-release-it.config.json path');

export const run = () => {
  const program = new Command();
  program
    .name('expo-release-it')
    .description(
      'Opinionated Expo CICD workflow CLI for building & uploading & submitting Expo projects on your machine',
    )
    .version(OptionHolder.cli.version);

  program
    .command('init')
    .description('Configure resources and environment')
    .addOption(configFileOption)
    .action(async (options) => handleError(init({ options })));

  program
    .command('bump')
    .description('Bump binary release patch version with modifying app.json')
    .addOption(
      new Option('-i --increment <increment>', 'Version increment mode')
        .default('patch')
        .choices(['major', 'minor', 'patch']),
    )
    .addOption(configFileOption)
    .action(async (options) =>
      handleError(bump({ options: { ...options, semverIncrement: options.increment } })),
    );

  program
    .command('build')
    .description('Build artifacts')
    .addOption(platformOption)
    .addOption(androidBuildOutputOption)
    .addOption(configFileOption)
    .action(async (options) => handleError(build({ options })));

  program
    .command('upload')
    .description('Upload artifact to play console internal test track(android) and testflight(ios)')
    .addOption(platformOption)
    .addOption(androidBuildOutputOption)
    .option('-m --uploadMetadata', 'Upload store text metadatas')
    .option('-s --uploadScreenshot', 'Upload store screenshots')
    .addOption(configFileOption)
    .action(async (options) => handleError(upload({ options })));

  program
    .command('submit')
    .description('Submit Google Play Console & App Store Connect Review with latest testing track')
    .addOption(platformOption)
    .option('-m --uploadMetadata', 'Upload store text metadatas')
    .option('-s --uploadScreenshot', 'Upload store screenshots')
    .addOption(configFileOption)
    .action(async (options) => handleError(submit({ options })));

  program
    .command('pull')
    .description('Download metadatas from stores')
    .addOption(platformOption)
    .option('-l --useLiveVersionIos', 'Download metadatas from live version rather than draft')
    .addOption(configFileOption)
    .action(async (options) => handleError(pull({ options })));

  program.parse();
};

async function handleError(promise: Promise<any>) {
  try {
    return await promise;
  } catch (e) {
    if (e instanceof ExecaError) {
      logger.error(`ExecaError: command: ${e.escapedCommand}`);
      logger.error(e.message);
      process.exit(e.exitCode ?? 1);
    } else {
      throwError(`Command Failed: ${e}`);
    }
  }
}
