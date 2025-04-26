import { prepareAndroid } from '../util/setup/prepareAndroid';
import { setup } from '../util/setup/setup';
import { prepareIos } from '../util/setup/prepareIos';
import { logger } from '../util/logger';
import { OptionHolder } from '../util/OptionHolder';
import { resolve } from '../util/FileUtil';
import chalk from 'chalk';
import { calculateElapsed } from '../util/calculateElapsed';
import { InqueryInputs } from '../util/input/InqueryInputs';
import { throwError } from '../util/throwError';
import { getAndroidFastlaneOptions, getIosFastlaneOptions } from '../util/FastlaneOption';
import { spinner } from '../util/spinner';
import { S } from '../util/setup/execShellScript';

export async function upload({ options }: { options: any }) {
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
  if (OptionHolder.input.platform !== 'ios') {
    await InqueryInputs.uploadMetadata();
  }
  if (OptionHolder.input.platform === 'ios' && OptionHolder.input.uploadMetadata) {
    logger.warn("ios upload command doesn't support uploading metadatas");
  }
}

async function uploadIos() {
  const iosDir = resolve(OptionHolder.projectDir, 'ios');
  const SS = S({
    cwd: iosDir,
    env: {
      MATCH_PASSWORD: OptionHolder.keyholderMap.ios_match_password,
    },
  });
  await prepareIos();
  await fastlane();

  async function fastlane() {
    await spinner('Bundler Install', SS`bundle install`);
    logger.success('Bundler Install');

    await spinner('Fastlane', SS`bundle exec fastlane upload ${getIosFastlaneOptions()}`);
  }
}
async function uploadAndroid() {
  const SS = S({
    cwd: resolve(OptionHolder.projectDir, 'android'),
  });
  await prepareAndroid();
  await fastlane();

  async function fastlane() {
    await spinner('Bundler Install', SS`bundle install`);
    logger.success('Bundler Install');
    try {
      await spinner('Fastlane', SS`bundle exec fastlane upload ${getAndroidFastlaneOptions()}`);
    } catch (e) {
      throwError('Fastlane failed');
    }
  }
}
