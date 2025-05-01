import pkgJson from '../../package.json';
import { resolve } from './FileUtil';
import { fileURLToPath } from 'url';

/**
 * CLI Comprehensive options
 * Each values can be empty by command and timing.
 */
export const OptionHolder: {
  // cli specific options
  cli: {
    // cli version
    version: string;
    // cli project root directory
    rootDir: string;
    // cli template source directory
    templateDir: string;
  };
  input: {
    platform: 'android' | 'ios';
    uploadMetadata: boolean;
    uploadScreenshot: boolean;
    androidOutput: 'apk' | 'aab';
    pod: boolean;
    useLiveVersionIos: boolean;
  };
  keyholderMap: {
    ios_app_identifier: string;
    ios_developer_team_id: string;
    ios_match_git_url: string;
    ios_app_store_connect_api_key_id: string;
    ios_app_store_connect_api_key_issuer_id: string;
    ios_xcode_project_target: string;
    ios_match_password: string;

    android_keystore_store_password: string;
    android_keystore_key_alias: string;
    android_keystore_key_password: string;
    android_package_name: string;
  };
  templateDirNames: string[];
  // dest project root directory
  projectDir: string;
  // dest project output of init command direcotry
  resourcesDir: string;
  keyDir: string;
  keyholderFilePath: string;
  tempDir: string;
  versionName: string;
  versionCode: string;
} = {
  cli: {
    version: pkgJson.version,
    rootDir: resolve(fileURLToPath(import.meta.url), '../..'),
    templateDir: resolve(fileURLToPath(import.meta.url), '../../template'),
  },
  input: {} as any,
  keyholderMap: {} as any,
  templateDirNames: ['key'],
  projectDir: '',
  resourcesDir: '',
  keyDir: '',
  keyholderFilePath: '',
  versionName: '',
  versionCode: '',
  tempDir: '',
};
