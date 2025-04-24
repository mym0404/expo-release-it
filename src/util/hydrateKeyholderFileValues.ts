import { OptionHolder } from './OptionHolder';
import { readJsonSlow } from './FileUtil';

export async function hydrateKeyholderFileValues() {
  Object.assign(OptionHolder.keyholderFileValueMap, readJsonSlow(OptionHolder.keyholderFilePath));
}
