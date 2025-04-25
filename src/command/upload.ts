import { prepareAndroid } from '../util/setup/prepareAndroid';
import { setup } from '../util/setup/setup';
import { prepareIos } from '../util/setup/prepareIos';
import { logger } from '../util/logger';
import { OptionHolder } from '../util/OptionHolder';
import { spinner, $ } from 'zx';
import { resolve } from '../util/FileUtil';
import chalk from 'chalk';
import { calculateElapsed } from '../util/calculateElapsed';
import { InqueryInputs } from '../util/input/InqueryInputs';

export type UploadOptions = {
  platform: 'ios' | 'android';
  uploadMetadata: boolean;
  androidOutput: 'apk' | 'aab';
};

export async function upload({ options }: { options: UploadOptions }) {
  Object.assign(OptionHolder.input, options);
  const startTime = Date.now();
  await setup();
  await promptInputs();

  logger.info('Build & Upload Started');
  logger.info(`Version: ${OptionHolder.versionName}(${OptionHolder.versionCode})`);

  if (OptionHolder.input.platform === 'ios') {
    await uploadIos();
    logger.success(`iOS Upload ${chalk.bold.inverse(calculateElapsed(startTime))}`);
  } else {
    await uploadAndroid();
    logger.success(`Android Upload ${chalk.bold.inverse(calculateElapsed(startTime))}`);
  }
}

async function promptInputs() {
  await InqueryInputs.platform();
  await InqueryInputs.androidBuildOutput();
  await InqueryInputs.uploadMetadata();
}

async function uploadIos() {
  const iosDir = resolve(OptionHolder.projectDir, 'ios');
  const $$ = $({
    verbose: false,
    cwd: iosDir,
    env: {
      MATCH_PASSWORD: OptionHolder.keyholderMap.ios_match_password,
    },
  });
  await prepareIos();
  await fastlane();

  async function fastlane() {
    await spinner('Bundler Install', () => $$`bundle install`);
    logger.success('Bundler Install');

    await spinner(
      'Fastlane',
      () =>
        $$`bundle exec fastlane upload ${[
          `version_name:${OptionHolder.versionName}`,
          `version_code:${OptionHolder.versionCode}`,
          `package_name:${OptionHolder.iosBundleIdentifier}`,
        ]}`,
    );
  }
}
async function uploadAndroid() {
  const $$ = $({
    verbose: false,
    cwd: resolve(OptionHolder.projectDir, 'android'),
  });
  await prepareAndroid();
  await fastlane();

  async function fastlane() {
    await spinner('Bundler Install', () => $$`bundle install`);
    logger.success('Bundler Install');
    await spinner(
      'Fastlane Supply',
      () =>
        $$`bundle exec fastlane deploy ${[
          `version_name:${OptionHolder.versionName}`,
          `version_code:${OptionHolder.versionCode}`,
          `package_name:${OptionHolder.androidPackageName}`,
          `upload_metadata:${OptionHolder.input.uploadMetadata}`,
          `aab_path:${resolve(OptionHolder.outputOfInitDir, 'output', 'android', 'aab', 'app-release.aab')}`,
          `apk_path:${resolve(OptionHolder.outputOfInitDir, 'output', 'android', 'apk', 'app-release.apk')}`,
          `skip_upload_apk:${OptionHolder.input.androidOutput !== 'apk'}`,
          `skip_upload_aab:${OptionHolder.input.androidOutput !== 'aab'}`,
        ]}`,
    );
  }
}
