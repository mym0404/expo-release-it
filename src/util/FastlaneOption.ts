import { OptionHolder } from './OptionHolder';
import { resolve } from './FileUtil';

export function getAndroidFastlaneOptions() {
  return [
    `version_name:${OptionHolder.versionName}`,
    `version_code:${OptionHolder.versionCode}`,
    `package_name:${OptionHolder.androidPackageName}`,
    `upload_metadata:${OptionHolder.input.uploadMetadata}`,
    `aab_path:${resolve(OptionHolder.outputOfInitDir, 'output', 'android', 'aab', 'app-release.aab')}`,
    `apk_path:${resolve(OptionHolder.outputOfInitDir, 'output', 'android', 'apk', 'app-release.apk')}`,
    `skip_upload_apk:${OptionHolder.input.androidOutput !== 'apk'}`,
    `skip_upload_aab:${OptionHolder.input.androidOutput !== 'aab'}`,
  ];
}

export function getIosFastlaneOptions() {
  return [
    `version_name:${OptionHolder.versionName}`,
    `version_code:${OptionHolder.versionCode}`,
    `ios_app_identifier:${OptionHolder.iosBundleIdentifier}`,
    `ios_xcode_project_target:${OptionHolder.keyholderMap.ios_xcode_project_target}`,
    `ios_developer_team_id:${OptionHolder.keyholderMap.ios_developer_team_id}`,
    `ios_app_store_connect_api_key_id:${OptionHolder.keyholderMap.ios_app_store_connect_api_key_id}`,
    `ios_app_store_connect_api_key_issuer_id:${OptionHolder.keyholderMap.ios_app_store_connect_api_key_issuer_id}`,
    `api_key_filepath:${resolve(OptionHolder.keyDir, 'ios_testflight_upload_api_key.p8')}`,
    `upload_metadata:${OptionHolder.input.uploadMetadata}`,
    `ipa_path:${resolve(OptionHolder.outputOfInitDir, 'output', 'ios', 'app.ipa')}`,
    `ipa_dir:${resolve(OptionHolder.outputOfInitDir, 'output', 'ios')}`,
    `ipa_name:app.ipa`,
  ];
}
