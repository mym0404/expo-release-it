import { parseBinaryVersion } from '../util/parseBinaryVersion';
import { promptCommonInputs } from '../util/promptCommonInputs';

export async function bump() {
  await promptCommonInputs();
  await parseBinaryVersion();
}
