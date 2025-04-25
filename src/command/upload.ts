import { select } from '@inquirer/prompts';
import { prepareAndroid } from '../util/setup/prepareAndroid';
import { setup } from '../util/setup/setup';
import { prepareIos } from '../util/setup/prepareIos';
import { logger } from '../util/logger';
import { OptionHolder } from '../util/OptionHolder';
import { spinner, $ } from 'zx';
import { resolve } from '../util/FileUtil';
import chalk from 'chalk';
import { calculateElapsed } from '../util/calculateElapsed';

export type UploadOptions = {
  platform: 'ios' | 'android';
};

export async function upload({ options }: { options: UploadOptions }) {
  Object.assign(OptionHolder.upload, options);
  const startTime = Date.now();
  await setup();
  await promptInputs();

  logger.info('Build & Upload Started');
  logger.info(`Version: ${OptionHolder.versionName}(${OptionHolder.versionCode})`);

  if (OptionHolder.upload.platform === 'ios') {
    await uploadIos();
    logger.success(`iOS Upload ${chalk.bold.inverse(calculateElapsed(startTime))}`);
  } else {
    await uploadAndroid();
    logger.success(`Android Upload ${chalk.bold.inverse(calculateElapsed(startTime))}`);
  }
}

async function promptInputs() {
  if (!OptionHolder.upload.platform) {
    OptionHolder.upload.platform = await select({
      message: 'Platform to release',
      choices: [
        { name: 'ios', value: 'ios', description: 'Release ios' },
        { name: 'android', value: 'android', description: 'Release android' },
      ],
    });
  }
}

async function uploadIos() {
  const iosDir = resolve(OptionHolder.projectDir, 'ios');
  const $$ = $({
    verbose: false,
    cwd: iosDir,
    env: {
      MATCH_PASSWORD: OptionHolder.keyholderFileValueMap.ios_match_password,
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
        $$`bundle exec fastlane upload version_name:${OptionHolder.versionName} version_code:${OptionHolder.versionCode}`,
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
        $$`bundle exec fastlane deploy version_name:${OptionHolder.versionName} version_code:${OptionHolder.versionCode}`,
    );
  }
}
