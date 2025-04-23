import {Command} from "commander";

import pkgJson from "../package.json";
import {log} from "./util/logutil";

const program = new Command()
program.name('expo-local-cicd')
  .description('generate CLI script to Build & Submit local Expo project')
  .version(pkgJson.version)

program.command('init')
  .description('Initialize CLI utilities')
  .action((name, options, command) => {
    log.info(name);
  })

program.parse()
