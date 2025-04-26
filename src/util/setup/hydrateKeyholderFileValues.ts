import { OptionHolder } from '../OptionHolder';
import { readJsonSlow } from '../FileUtil';

export async function hydrateKeyholderFileValues() {
  Object.assign(OptionHolder.keyholderMap, readJsonSlow(OptionHolder.keyholderFilePath));
}
