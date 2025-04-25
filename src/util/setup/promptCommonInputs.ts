import { OptionHolder } from '../OptionHolder';
import { input } from '@inquirer/prompts';
import { isDev } from '../EnvUtil';
import { exist, resolve } from '../FileUtil';

export async function promptCommonInputs() {
  OptionHolder.rootDir = isDev
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

  OptionHolder.outDir = resolve(OptionHolder.rootDir, 'expo-local-build');
  OptionHolder.keyDir = resolve(OptionHolder.outDir, 'key');
  OptionHolder.keyholderFilePath = resolve(OptionHolder.outDir, 'keyholder.json');
}
