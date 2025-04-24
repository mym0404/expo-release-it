import { parseBinaryVersion } from '../util/parseBinaryVersion';

export async function submit() {
  await parseBinaryVersion();
}
