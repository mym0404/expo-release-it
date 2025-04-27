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
import { exe } from '../util/setup/execShellScript';

export async function submit({ options }: { options: any }) {
  Object.assign(OptionHolder.input, options);
  const startTime = Date.now();
  await setup();
  await promptInputs();

  logger.info('Submit Started');

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

async function submitIos() {
  const iosDir = resolve(OptionHolder.projectDir, 'ios');
  await prepareIos();
  await fastlane();

  async function fastlane() {
    remove(resolve(iosDir, '.xcode.env.local'));

    await exe('bundle', ['exec', 'fastlane', 'submit', ...getIosFastlaneOptions()], {
      cwd: iosDir,
      env: {
        MATCH_PASSWORD: OptionHolder.keyholderMap.ios_match_password,
      },
    });
  }
}

async function submitAndroid() {
  await prepareAndroid();
  await fastlane();

  async function fastlane() {
    await exe('bundle', ['exec', 'fastlane', 'submit', ...getAndroidFastlaneOptions()], {
      cwd: resolve(OptionHolder.projectDir, 'android'),
    });
  }
}
