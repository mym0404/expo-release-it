import { promptCommonInputs } from './promptCommonInputs';
import { hydrateKeyholderFileValues } from './hydrateKeyholderFileValues';
import { parseBinaryVersions } from './VersionUtil';

export async function setup() {
  await promptCommonInputs();
  await hydrateKeyholderFileValues();
  await parseBinaryVersions();
}
