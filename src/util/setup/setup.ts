import { hydrateKeyholderFileValues } from './hydrateKeyholderFileValues';
import { parseBinaryVersions } from './VersionUtil';
import { OptionHolder } from '../OptionHolder';
import { isDev } from '../EnvUtil';
import { resolve } from '../FileUtil';

export async function setup() {
  await setupBasicOptions();

  await hydrateKeyholderFileValues();
  await parseBinaryVersions();
}

export async function setupBasicOptions() {
  OptionHolder.projectDir = isDev ? resolve('example') : resolve('.');
  OptionHolder.outputOfInitDir = resolve(OptionHolder.projectDir, 'expo-release-it');
  OptionHolder.keyDir = resolve(OptionHolder.outputOfInitDir, 'key');
  OptionHolder.keyholderFilePath = resolve(OptionHolder.outputOfInitDir, 'keyholder.json');
  OptionHolder.tempDir = resolve(OptionHolder.outputOfInitDir, '.temp');
}
