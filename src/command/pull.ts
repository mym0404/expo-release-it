import { OptionHolder } from '../util/OptionHolder';
import { InqueryInputs } from '../util/input/InqueryInputs';
import { setup } from '../util/setup/setup';
import { join, resolve } from '../util/FileUtil';
import { exe } from '../util/setup/execShellScript';
import { prepareIos } from '../util/setup/prepareIos';
import { prepareAndroid } from '../util/setup/prepareAndroid';
import { generateAppStoreConnectApiKeyFile } from '../util/generateAppStoreConnectApiKeyFile';
import { copyIosMetadata, copyAndroidMetadata } from '../util/MetadataSyncUtil';

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
}

async function pullIosMetadata() {
  await prepareIos();
  const iosDir = join(OptionHolder.projectDir, 'ios');
  const exeEnv = exe({
    cwd: iosDir,
    env: {
      MATCH_PASSWORD: OptionHolder.keyholderMap.ios_match_password,
    },
  });

  await exeEnv('bundle', [
    'exec',
    'fastlane',
    'deliver',
    'download_metadata',
    '-f',
    '--api_key_path',
    generateAppStoreConnectApiKeyFile(),
  ]);

  await exeEnv('bundle', [
    'exec',
    'fastlane',
    'deliver',
    'download_screenshots',
    '-f',
    '--api_key_path',
    generateAppStoreConnectApiKeyFile(),
  ]);

  copyIosMetadata('resources');
}

async function pullAndroidMetadata() {
  await prepareAndroid();
  const androidDir = join(OptionHolder.projectDir, 'android');

  await exe(
    'bundle',
    [
      'exec',
      'fastlane',
      'supply',
      'init',
      '--json_key',
      resolve(OptionHolder.keyDir, 'android_play_console_service_account.json'),
      '--package_name',
      OptionHolder.keyholderMap.android_package_name,
    ],
    { cwd: androidDir },
  );

  copyAndroidMetadata('resouces');
}
