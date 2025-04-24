import { parseBinaryVersion } from '../util/parseBinaryVersion';
import { promptCommonInputs } from '../util/promptCommonInputs';

export async function submit() {
  await promptCommonInputs();
  await parseBinaryVersion();
}
