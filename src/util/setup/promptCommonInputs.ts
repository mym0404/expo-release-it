import { OptionHolder } from '../OptionHolder';
import { input } from '@inquirer/prompts';
import { isDev } from '../EnvUtil';
import { exist, resolve } from '../FileUtil';

export async function promptCommonInputs() {
  OptionHolder.projectDir = isDev
    ? resolve('example')
    : resolve(
        await input({
          message: 'react native project root directory path',
          default: isDev ? 'example' : '.',
          validate: (value) => {
            const p = resolve(value, 'package.json');
            if (!exist(p)) {
              return "package.json hasn\'t been detected. provider valid project root.";
            }
            return true;
          },
        }),
      );

  OptionHolder.outputOfInitDir = resolve(OptionHolder.projectDir, 'expo-local-build');
  OptionHolder.keyDir = resolve(OptionHolder.outputOfInitDir, 'key');
  OptionHolder.keyholderFilePath = resolve(OptionHolder.outputOfInitDir, 'keyholder.json');
}
