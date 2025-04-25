import { Command, Option } from 'commander';

import { init } from './command/init';
import { OptionHolder } from './util/OptionHolder';
import { logger } from './util/logger';
import { bump } from './command/bump';
import { upload } from './command/upload';
import { submit } from './command/submit';

export const run = () => {
  const platformOption = new Option('-p --platform <platform>', 'Platform').choices([
    'android',
    'ios',
  ]);

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
        logger.error(e);
      }
    });

  program
    .command('bump')
    .description('Bump binary release patch version with modifying app.json')
    // .addOption(
    //   new Option('-i --increment <type>', 'increment type').choices(['major', 'minor', 'patch']),
    // )
    .action(async (options) => {
      await bump({ options });
    });

  program
    .command('build')
    .description('Build binary')
    .addOption(platformOption)
    .action(async (options) => {
      await upload({ options });
    });

  program
    .command('upload')
    .description('Upload artifact to play console internal test track(android) and testflight(ios)')
    .addOption(platformOption)
    .action(async (options) => {
      await upload({ options });
    });

  program
    .command('submit')
    .description('Submit Google Play Console & App Store Connect Review with latest testing track')
    .addOption(platformOption)
    .action(async (options) => {
      await submit({ options });
    });

  program.parse();
};
