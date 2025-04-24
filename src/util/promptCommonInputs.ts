import { OptionHolder } from './OptionHolder';
import path from 'node:path';
import { input } from '@inquirer/prompts';
import { isDev } from './EnvUtil';
import fs from 'fs-extra';

export async function promptCommonInputs() {
  OptionHolder.rootDir = path.resolve(
    await input({
      message: 'react native project root directory path',
      default: isDev ? 'example' : '.',
      validate: (value) => {
        const p = path.resolve(value, 'package.json');
        if (!fs.existsSync(p)) {
          return "package.json hasn\'t been detected. provider valid project root.";
        }
        return true;
      },
    }),
  );
}
