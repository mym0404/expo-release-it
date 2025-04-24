import { parseBinaryVersion } from '../util/parseBinaryVersion';

export async function bump() {
  await parseBinaryVersion();
}
