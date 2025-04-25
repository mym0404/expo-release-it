import pkgJson from '../../package.json';
import { resolve } from './FileUtil';
import type { BuildOptions } from '../command/build';
import type { InitOptions } from '../command/init';
import type { BumpOptions } from '../command/bump';
import type { SubmitOptions } from '../command/submit';
import type { UploadOptions } from '../command/upload';

/**
 * CLI Comprehensive options
 * Each values can be empty by command and timing.
 */
export const OptionHolder: {
  cli: { version: string; rootDir: string; templateDir: string };
  init: InitOptions;
  bump: BumpOptions;
  build: BuildOptions;
  upload: UploadOptions;
  submit: SubmitOptions;

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
    ios_match_password: string;
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
    rootDir: resolve(__dirname, '../..'),
    templateDir: resolve(__dirname, '../../template'),
  },
  init: {} as any,
  bump: {} as any,
  build: {} as any,
  upload: {} as any,
  submit: {} as any,
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
