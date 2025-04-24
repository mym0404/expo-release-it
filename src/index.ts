import { Command } from 'commander';

import { init } from './command/init';
import { OptionHolder } from './util/OptionHolder';
import { log } from './util/Log';
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
      log.error(e);
    }
  });

program
  .command('bump')
  .description('Bump binary release patch version with modifying app.json')
  .action(async () => {
    await bump();
  });

program
  .command('release')
  .description('Build binary & upload to internal test track(android) and testflight(ios)')
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
