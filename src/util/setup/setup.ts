import {
  getEncryptionKey,
  loadRuntimeCredentials,
  warnPlaintextCredentials,
} from '../CredentialVault';
import { isDev } from '../EnvUtil';
import { resolve } from '../FileUtil';
import { OptionHolder } from '../OptionHolder';
import { parseConfigFile } from '../parseConfigFile';
import { parseBinaryVersions } from './VersionUtil';

export async function setup({ credentials = true } = {}) {
  OptionHolder.projectDir = isDev ? resolve('examples/sdk-57') : resolve('.');
  OptionHolder.resourcesDir = resolve(OptionHolder.projectDir, 'expo-release-it');
  OptionHolder.keyDir = resolve(OptionHolder.resourcesDir, 'key');
  OptionHolder.keyholderFilePath = resolve(OptionHolder.resourcesDir, 'keyholder.json');
  OptionHolder.tempDir = resolve(OptionHolder.resourcesDir, '.temp');
  const key = getEncryptionKey();
  await parseConfigFile();
  if (credentials) loadRuntimeCredentials(key);
  else warnPlaintextCredentials();
  await parseBinaryVersions();
  return key;
}
