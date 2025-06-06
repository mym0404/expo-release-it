import { exist, readJsonSlow } from '../FileUtil';
import { OptionHolder } from '../OptionHolder';

export async function hydrateKeyholderFileValues() {
  if (exist(OptionHolder.keyholderFilePath)) {
    Object.assign(OptionHolder.keyholderMap, readJsonSlow(OptionHolder.keyholderFilePath));
  }
}
