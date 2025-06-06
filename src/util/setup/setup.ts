import { isDev } from '../EnvUtil';
import { resolve } from '../FileUtil';
import { OptionHolder } from '../OptionHolder';
import { parseConfigFile } from '../parseConfigFile';
import { parseBinaryVersions } from './VersionUtil';
import { hydrateKeyholderFileValues } from './hydrateKeyholderFileValues';

export async function setup() {
  await setupBasicOptions();
  await parseConfigFile();
  await hydrateKeyholderFileValues();
  await parseBinaryVersions();
}

export async function setupBasicOptions() {
  OptionHolder.projectDir = isDev ? resolve('example') : resolve('.');
  OptionHolder.resourcesDir = resolve(OptionHolder.projectDir, 'expo-release-it');
  OptionHolder.keyDir = resolve(OptionHolder.resourcesDir, 'key');
  OptionHolder.keyholderFilePath = resolve(OptionHolder.resourcesDir, 'keyholder.json');
  OptionHolder.tempDir = resolve(OptionHolder.resourcesDir, '.temp');
}
