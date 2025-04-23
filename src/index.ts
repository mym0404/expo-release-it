import {Command} from "commander";

import pkgJson from "../package.json";

const program = new Command()
program.name('expo-local-cicd')
  .description('generate CLI script to Build & Submit local Expo project')
  .version(pkgJson.version)

program.command('init')
  .description('Initialize CLI utilities')

program.parse()
