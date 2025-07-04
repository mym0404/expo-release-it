import chalk from 'chalk';
import { calculateElapsed } from '../util/calculateElapsed';
import { getAndroidFastlaneOptions, getIosFastlaneOptions } from '../util/FastlaneOption';
import { resolve } from '../util/FileUtil';
import { InqueryInputs } from '../util/input/InqueryInputs';
import { logger } from '../util/logger';
import { OptionHolder } from '../util/OptionHolder';
import { exe } from '../util/setup/execShellScript';
import { prepareAndroid } from '../util/setup/prepareAndroid';
import { prepareIos } from '../util/setup/prepareIos';
import { setup } from '../util/setup/setup';

export async function upload({ options }: { options: any }) {
  Object.assign(OptionHolder.input, options);
  const startTime = Date.now();
  await setup();
  await promptInputs();

  logger.info('Upload Testing Track Started');

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
    await InqueryInputs.uploadScreenshot();
  }
  if (
    OptionHolder.input.platform === 'ios' &&
    (OptionHolder.input.uploadMetadata || OptionHolder.input.uploadScreenshot)
  ) {
    logger.warn("ios upload command doesn't support uploading metadatas and screenshots");
  }
}

async function uploadIos() {
  const iosDir = resolve(OptionHolder.projectDir, 'ios');
  await prepareIos();
  await fastlane();

  async function fastlane() {
    await exe('bundle', ['exec', 'fastlane', 'upload', ...getIosFastlaneOptions()], {
      cwd: iosDir,
      env: {
        MATCH_PASSWORD: OptionHolder.keyholderMap.ios_match_password,
      },
    });
  }
}
async function uploadAndroid() {
  await prepareAndroid();
  await fastlane();

  async function fastlane() {
    await exe('bundle', ['exec', 'fastlane', 'upload', ...getAndroidFastlaneOptions()], {
      cwd: resolve(OptionHolder.projectDir, 'android'),
    });
  }
}
