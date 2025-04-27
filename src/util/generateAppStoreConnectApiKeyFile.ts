import { OptionHolder } from './OptionHolder';
import { resolve, read, writeJson, join } from './FileUtil';

export function generateAppStoreConnectApiKeyFile() {
  const json = {
    key: read(resolve(OptionHolder.keyDir, 'ios_app_store_connect_api_key.p8')),
    key_id: OptionHolder.keyholderMap.ios_app_store_connect_api_key_id,
    issuer_id: OptionHolder.keyholderMap.ios_app_store_connect_api_key_issuer_id,
  };
  const file = join(OptionHolder.tempDir, 'app_store_connect_api.json');
  writeJson(file, json);
  return file;
}
