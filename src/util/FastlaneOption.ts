import { OptionHolder } from './OptionHolder';
import { resolve } from './FileUtil';

export function getAndroidFastlaneOptions() {
  return [
    ...Object.entries(OptionHolder.keyholderMap).map(([k, v]) => `${k}:${v}`),
    `json_key:${resolve(OptionHolder.keyDir, 'android_play_console_service_account.json')}`,
    `version_name:${OptionHolder.versionName}`,
    `version_code:${OptionHolder.versionCode}`,
    `upload_metadata:${OptionHolder.input.uploadMetadata}`,
    `upload_screenshot:${OptionHolder.input.uploadScreenshot}`,
    `aab_path:${resolve(OptionHolder.resourcesDir, 'output', 'android', 'aab', 'app-release.aab')}`,
    `apk_path:${resolve(OptionHolder.resourcesDir, 'output', 'android', 'apk', 'app-release.apk')}`,
    `skip_upload_apk:${OptionHolder.input.androidOutput !== 'apk'}`,
    `skip_upload_aab:${OptionHolder.input.androidOutput !== 'aab'}`,
  ];
}

export function getIosFastlaneOptions() {
  return [
    ...Object.entries(OptionHolder.keyholderMap).map(([k, v]) => `${k}:${v}`),
    `version_name:${OptionHolder.versionName}`,
    `version_code:${OptionHolder.versionCode}`,
    `api_key_filepath:${resolve(OptionHolder.keyDir, 'ios_app_store_connect_api_key.p8')}`,
    `upload_metadata:${OptionHolder.input.uploadMetadata}`,
    `upload_screenshot:${OptionHolder.input.uploadScreenshot}`,
    `ipa_path:${resolve(OptionHolder.resourcesDir, 'output', 'ios', 'app.ipa')}`,
    `ipa_dir:${resolve(OptionHolder.resourcesDir, 'output', 'ios')}`,
    `ipa_name:app.ipa`,
  ];
}
