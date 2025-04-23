import { Command } from 'commander';

import { init } from './command/init';
import { OptionHolder } from './util/OptionHolder';
import { log } from './util/Log';

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
      log.error(e);
    }
  });

program.parse();
