import { parseBinaryVersion } from '../util/parseBinaryVersion';

export async function release() {
  await parseBinaryVersion();
}
