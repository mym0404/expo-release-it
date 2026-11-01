import { credentialFilenames, credentialKeyPath } from './CredentialVault';
import { resolve } from './FileUtil';
import { OptionHolder } from './OptionHolder';
import type { RubyEnvironment } from './setup/RubyEnvironment';

export async function runFastlane(ruby: RubyEnvironment, lane: 'build' | 'upload' | 'submit') {
  const { keyholderMap: keys, input, resourcesDir } = OptionHolder;
  const options = {
    version_name: OptionHolder.versionName,
    version_code: OptionHolder.versionCode,
    upload_metadata: input.uploadMetadata,
    upload_screenshot: input.uploadScreenshot,
    ...(input.platform === 'ios'
      ? {
          ios_app_identifier: keys.ios_app_identifier,
          ios_developer_team_id: keys.ios_developer_team_id,
          ios_match_git_url: keys.ios_match_git_url,
          ios_app_store_connect_api_key_id: keys.ios_app_store_connect_api_key_id,
          ios_app_store_connect_api_key_issuer_id: keys.ios_app_store_connect_api_key_issuer_id,
          api_key_filepath:
            input.sign === false ? undefined : credentialKeyPath(credentialFilenames.iosApiKey),
          project: input.iosProject,
          target: input.iosTarget,
          scheme: input.iosScheme,
          workspace: input.iosWorkspace,
          no_sign: input.sign === false,
          ipa_path: resolve(resourcesDir, 'output', 'ios', 'app.ipa'),
          ipa_dir: resolve(resourcesDir, 'output', 'ios'),
          ipa_name: 'app.ipa',
          archive_path: resolve(resourcesDir, 'output', 'ios', 'app.xcarchive'),
        }
      : {
          android_package_name: keys.android_package_name,
          json_key: credentialKeyPath(credentialFilenames.androidServiceAccount),
          aab_path: resolve(resourcesDir, 'output', 'android', 'aab', 'app-release.aab'),
          apk_path: resolve(resourcesDir, 'output', 'android', 'apk', 'app-release.apk'),
          skip_upload_apk: input.androidOutput !== 'apk',
          skip_upload_aab: input.androidOutput !== 'aab',
        }),
  };
  await ruby.bundle(['exec', 'fastlane', input.platform, lane], {
    env: {
      EXPO_RELEASE_IT_OPTIONS: JSON.stringify(options),
      MATCH_PASSWORD:
        lane === 'build' && input.sign !== false ? (keys.ios_match_password ?? '') : '',
    },
  });
}
