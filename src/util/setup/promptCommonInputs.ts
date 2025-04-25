import { OptionHolder } from '../OptionHolder';
import { isDev } from '../EnvUtil';
import { resolve } from '../FileUtil';

export async function promptCommonInputs() {
  OptionHolder.projectDir = isDev ? resolve('example') : resolve('.');

  OptionHolder.outputOfInitDir = resolve(OptionHolder.projectDir, 'expo-release-it');
  OptionHolder.keyDir = resolve(OptionHolder.outputOfInitDir, 'key');
  OptionHolder.keyholderFilePath = resolve(OptionHolder.outputOfInitDir, 'keyholder.json');
}
