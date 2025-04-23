import pkgJson from '../../package.json';
import { fileURLToPath } from 'url';
import * as path from 'node:path';

export type ProgramOptions = {
  rootDir?: string;
  outDir?: string;
};

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
  };
  iosBundleIdentifier: string;
  androidPackageName: string;
  templateDirNames: string[];
} & Required<ProgramOptions> = {
  cli: {
    version: pkgJson.version,
    rootDir: path.resolve(fileURLToPath(import.meta.url), '../../..'),
    templateDir: path.resolve(fileURLToPath(import.meta.url), '../../../template'),
  },
  templateValuePlaceholderMap: {} as any,
  templateDirNames: ['fastlane-android', 'fastlane-ios', 'key', 'expo-local-build-scripts'],
  iosBundleIdentifier: '',
  androidPackageName: '',
  rootDir: '',
  outDir: '',
};
