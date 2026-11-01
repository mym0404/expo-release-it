import {
  appStoreApiFilename,
  credentialFilenames,
  readCredentialFile,
  writeCredentialTemporaryFile,
} from './CredentialVault';
import { OptionHolder } from './OptionHolder';

export function generateAppStoreConnectApiKeyFile() {
  const json = {
    key: readCredentialFile(credentialFilenames.iosApiKey).toString('utf8'),
    key_id: OptionHolder.keyholderMap.ios_app_store_connect_api_key_id,
    issuer_id: OptionHolder.keyholderMap.ios_app_store_connect_api_key_issuer_id,
  };
  return writeCredentialTemporaryFile(appStoreApiFilename, Buffer.from(JSON.stringify(json)));
}
