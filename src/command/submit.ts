import { parseBinaryVersions } from '../util/VersionUtil';
import { promptCommonInputs } from '../util/promptCommonInputs';

export async function submit() {
  await promptCommonInputs();
  await parseBinaryVersions();
}
