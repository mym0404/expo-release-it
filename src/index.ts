import { Command } from 'commander';

import { init } from './command/init';
import { OptionHolder } from './util/OptionHolder';

const program = new Command();
program
  .name('expo-local-cicd')
  .description('generate CLI script to Build & Submit local Expo project')
  .version(OptionHolder.cli.version);

program
  .command('init')
  .description('Initialize CLI utilities')
  .action(async (options) => {
    await init({ options });
  });

program.parse();
