import { OptionHolder } from './OptionHolder';
import { resolve } from './FileUtil';

export function getAndroidFastlaneOptions() {
  return [
    ...Object.entries(OptionHolder.keyholderMap).map(([k, v]) => `${k}:${v}`),
    `version_name:${OptionHolder.versionName}`,
    `version_code:${OptionHolder.versionCode}`,
    `upload_metadata:${OptionHolder.input.uploadMetadata}`,
    `aab_path:${resolve(OptionHolder.outputOfInitDir, 'output', 'android', 'aab', 'app-release.aab')}`,
    `apk_path:${resolve(OptionHolder.outputOfInitDir, 'output', 'android', 'apk', 'app-release.apk')}`,
    `skip_upload_apk:${OptionHolder.input.androidOutput !== 'apk'}`,
    `skip_upload_aab:${OptionHolder.input.androidOutput !== 'aab'}`,
  ];
}

export function getIosFastlaneOptions() {
  return [
    ...Object.entries(OptionHolder.keyholderMap).map(([k, v]) => `${k}:${v}`),
    `version_name:${OptionHolder.versionName}`,
    `version_code:${OptionHolder.versionCode}`,
    `api_key_filepath:${resolve(OptionHolder.keyDir, 'ios_testflight_upload_api_key.p8')}`,
    `upload_metadata:${OptionHolder.input.uploadMetadata}`,
    `ipa_path:${resolve(OptionHolder.outputOfInitDir, 'output', 'ios', 'app.ipa')}`,
    `ipa_dir:${resolve(OptionHolder.outputOfInitDir, 'output', 'ios')}`,
    `ipa_name:app.ipa`,
  ];
}
