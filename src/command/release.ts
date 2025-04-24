import { parseBinaryVersions } from '../util/VersionUtil';
import { promptCommonInputs } from '../util/promptCommonInputs';

export async function release() {
  await promptCommonInputs();
  await parseBinaryVersions();
}
