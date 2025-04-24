import { parseBinaryVersion } from '../util/parseBinaryVersion';
import { promptCommonInputs } from '../util/promptCommonInputs';

export async function release() {
  await promptCommonInputs();
  await parseBinaryVersion();
}
