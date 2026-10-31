import { resolve } from '../util/FileUtil';
import { generateAppStoreConnectApiKeyFile } from '../util/generateAppStoreConnectApiKeyFile';
import { InqueryInputs } from '../util/input/InqueryInputs';
import { copyAndroidMetadata, copyIosMetadata } from '../util/MetadataSyncUtil';
import { OptionHolder } from '../util/OptionHolder';
import { prepareFastlane } from '../util/setup/prepareFastlane';
import { setup } from '../util/setup/setup';

export async function pull({ options }: { options: any }) {
  Object.assign(OptionHolder.input, options);
  await setup();
  await promptInputs();

  if (OptionHolder.input.platform === 'ios') {
    await pullIosMetadata();
  } else {
    await pullAndroidMetadata();
  }
}

async function promptInputs() {
  await InqueryInputs.platform();
  await InqueryInputs.useLiveVersionIos();
}

async function pullIosMetadata() {
  const ruby = await prepareFastlane();
  const metadataPath = resolve(ruby.workspace, 'fastlane', 'metadata');
  const screenshotsPath = resolve(ruby.workspace, 'fastlane', 'screenshots');
  await ruby.bundle([
    'exec',
    'fastlane',
    'deliver',
    'download_metadata',
    '--metadata_path',
    metadataPath,
    '-f',
    '--app_identifier',
    OptionHolder.keyholderMap.ios_app_identifier,
    '--api_key_path',
    generateAppStoreConnectApiKeyFile(),
  ]);

  await ruby.bundle([
    'exec',
    'fastlane',
    'deliver',
    'download_screenshots',
    '--screenshots_path',
    screenshotsPath,
    '-f',
    '--app_identifier',
    OptionHolder.keyholderMap.ios_app_identifier,
    '--api_key_path',
    generateAppStoreConnectApiKeyFile(),
    '--use_live_version',
    `${OptionHolder.input.useLiveVersionIos}`,
  ]);

  copyIosMetadata('resources', ruby.workspace);
}

async function pullAndroidMetadata() {
  const ruby = await prepareFastlane();

  await ruby.bundle([
    'exec',
    'fastlane',
    'supply',
    'init',
    '--metadata_path',
    resolve(ruby.workspace, 'fastlane', 'metadata', 'android'),
    '--json_key',
    resolve(OptionHolder.keyDir, 'android_play_console_service_account.json'),
    '--package_name',
    OptionHolder.keyholderMap.android_package_name,
  ]);

  copyAndroidMetadata('resources', ruby.workspace);
}
