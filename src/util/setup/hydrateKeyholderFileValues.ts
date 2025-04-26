import { OptionHolder } from '../OptionHolder';
import { readJsonSlow, exist } from '../FileUtil';

export async function hydrateKeyholderFileValues() {
  if (exist(OptionHolder.keyholderFilePath)) {
    Object.assign(OptionHolder.keyholderMap, readJsonSlow(OptionHolder.keyholderFilePath));
  }
}
