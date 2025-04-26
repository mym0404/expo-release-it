import { Command, Option } from 'commander';

import { init } from './command/init';
import { OptionHolder } from './util/OptionHolder';
import { bump } from './command/bump';
import { upload } from './command/upload';
import { submit } from './command/submit';
import { build } from './command/build';
import { pull } from './command/pull';
import { throwError } from './util/throwError';

const platformOption = new Option('-p --platform <platform>', 'Platform').choices([
  'android',
  'ios',
]);
const androidBuildOutputOption = new Option(
  '--androidOutput <output>',
  'Android Build Output',
).choices(['aab', 'apk']);

export const run = () => {
  const program = new Command();
  program
    .name('expo-release-it')
    .description('Build & Upload & Submit locally for Expo project')
    .version(OptionHolder.cli.version);

  program
    .command('init')
    .description('Initialize CLI utilities')
    .action(async (options) => {
      try {
        await init({ options });
      } catch (e: any) {
        throwError('Command Failed');
      }
    });

  program
    .command('bump')
    .description('Bump binary release patch version with modifying app.json')
    // .addOption(
    //   new Option('-i --increment <type>', 'increment type').choices(['major', 'minor', 'patch']),
    // )
    .action(async (options) => {
      try {
        await bump({ options });
      } catch (e) {
        throwError('Command Failed');
      }
    });

  program
    .command('build')
    .description('Build binary')
    .addOption(platformOption)
    .addOption(androidBuildOutputOption)
    .action(async (options) => {
      try {
        await build({ options });
      } catch (e) {
        throwError('Command Failed');
      }
    });

  program
    .command('upload')
    .description('Upload artifact to play console internal test track(android) and testflight(ios)')
    .addOption(platformOption)
    .addOption(androidBuildOutputOption)
    .option('-m --uploadMetadata', 'Upload store metadatas')
    .action(async (options) => {
      try {
        await upload({ options });
      } catch (e) {
        throwError('Command Failed');
      }
    });

  program
    .command('submit')
    .description('Submit Google Play Console & App Store Connect Review with latest testing track')
    .addOption(platformOption)
    .action(async (options) => {
      try {
        await submit({ options });
      } catch (e) {
        throwError('Command Failed');
      }
    });

  program
    .command('pull')
    .description('Sync registered metadatas from stores')
    .addOption(platformOption)
    .action(async (options) => {
      try {
        await pull({ options });
      } catch (e) {
        throwError('Command Failed');
      }
    });

  program.parse();
};
