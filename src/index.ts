import { Command } from 'commander';

import { init } from './command/init';
import { OptionHolder } from './util/OptionHolder';
import { logger } from './util/logger';
import { bump } from './command/bump';
import { release } from './command/release';
import { submit } from './command/submit';

const program = new Command();
program
  .name('expo-local-cicd')
  .description('generate CLI script to Build & Submit local Expo project')
  .version(OptionHolder.cli.version);

program
  .command('init')
  .description('Initialize CLI utilities')
  .action(async () => {
    try {
      await init();
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
  .command('release')
  .description('Build binary & upload to internal test track(android) and testflight(ios)')
  .option('-p --platform <platform>', 'Platform', 'ios')
  .action(async () => {
    await release();
  });

program
  .command('submit')
  .description('Submit Google Play Console & App Store Connect Review with latest testing track')
  .action(async () => {
    await submit();
  });

program.parse();
