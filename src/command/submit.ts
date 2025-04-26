import { setup } from '../util/setup/setup';
import { logger } from '../util/logger';
import { OptionHolder } from '../util/OptionHolder';
import chalk from 'chalk';
import { calculateElapsed } from '../util/calculateElapsed';
import { prepareAndroid } from '../util/setup/prepareAndroid';
import { remove, resolve } from '../util/FileUtil';
import { prepareIos } from '../util/setup/prepareIos';
import { InqueryInputs } from '../util/input/InqueryInputs';
import { getIosFastlaneOptions, getAndroidFastlaneOptions } from '../util/FastlaneOption';
import { S } from '../util/setup/execShellScript';

export async function submit({ options }: { options: any }) {
  Object.assign(OptionHolder.input, options);
  const startTime = Date.now();
  await setup();
  await promptInputs();

  logger.info('Submit Started');
  logger.info(`Version: ${OptionHolder.versionName}(${OptionHolder.versionCode})`);

  if (OptionHolder.input.platform === 'ios') {
    await submitIos();
    logger.success(`Appstore Review Submitted ${chalk.bold.inverse(calculateElapsed(startTime))}`);
  } else {
    await submitAndroid();
    logger.success(`Playstore Review Submitted ${chalk.bold.inverse(calculateElapsed(startTime))}`);
  }
}

async function promptInputs() {
  await InqueryInputs.platform();
  await InqueryInputs.uploadMetadata();
}

async function submitAndroid() {
  const SS = S({
    cwd: resolve(OptionHolder.projectDir, 'android'),
  });
  await prepareAndroid();
  await fastlane();

  async function fastlane() {
    await SS`bundle exec fastlane sumbit ${getIosFastlaneOptions()}`;
  }
}
async function submitIos() {
  const iosDir = resolve(OptionHolder.projectDir, 'ios');
  const SS = S({
    cwd: iosDir,
  });
  await prepareIos();
  await fastlane();

  async function fastlane() {
    remove(resolve(iosDir, '.xcode.env.local'));

    await SS`bundle exec fastlane submit ${getAndroidFastlaneOptions()}`;
  }
}
