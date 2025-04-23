import pkgJson from '../../package.json';
import { fileURLToPath } from 'url';
import * as path from 'node:path';

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
    android_keystore_store_password: string;
    android_keystore_key_alias: string;
    android_keystore_key_password: string;
  };
  iosBundleIdentifier: string;
  androidPackageName: string;
  templateDirNames: string[];
  rootDir: string;
  outDir: string;
} = {
  cli: {
    version: pkgJson.version,
    rootDir: path.resolve(fileURLToPath(import.meta.url), '../../..'),
    templateDir: path.resolve(fileURLToPath(import.meta.url), '../../../template'),
  },
  templateValuePlaceholderMap: {} as any,
  templateDirNames: ['fastlane-android', 'fastlane-ios', 'key'],
  iosBundleIdentifier: '',
  androidPackageName: '',
  rootDir: '',
  outDir: '',
};
