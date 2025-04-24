import pkgJson from '../../package.json';
import { fileURLToPath } from 'url';
import { resolve } from './FileUtil';

export const OptionHolder: {
  cli: { version: string; rootDir: string; templateDir: string };
  templateValuePlaceholderMap: {
    ios_app_identifier: string;
    ios_app_store_connect_team_id: string;
    ios_developer_team_id: string;
    ios_match_git_url: string;
    ios_app_store_connect_api_key_id: string;
    ios_app_store_connect_api_key_issuer_id: string;
    ios_xcode_project_target: string;
    android_package_name: string;
    key_dir_relative_path: string;
  };
  keyholderFileValueMap: {
    android_keystore_store_password: string;
    android_keystore_key_alias: string;
    android_keystore_key_password: string;
  };
  iosBundleIdentifier: string;
  androidPackageName: string;
  templateDirNames: string[];
  rootDir: string;
  outDir: string;
  keyDir: string;
  keyholderFilePath: string;
  versionName: string;
  versionCode: string;
} = {
  cli: {
    version: pkgJson.version,
    rootDir: resolve(fileURLToPath(import.meta.url), '../../..'),
    templateDir: resolve(fileURLToPath(import.meta.url), '../../../template'),
  },
  templateValuePlaceholderMap: {} as any,
  keyholderFileValueMap: {} as any,
  templateDirNames: ['fastlane-android', 'fastlane-ios', 'key'],
  iosBundleIdentifier: '',
  androidPackageName: '',
  rootDir: '',
  outDir: '',
  keyDir: '',
  keyholderFilePath: '',
  versionName: '',
  versionCode: '',
};
