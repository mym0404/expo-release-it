import { setup } from '../util/setup/setup';
import { logger } from '../util/logger';
import { OptionHolder } from '../util/OptionHolder';
import chalk from 'chalk';
import { calculateElapsed } from '../util/calculateElapsed';
import { spinner, $ } from 'zx';
import { prepareAndroid } from '../util/setup/prepareAndroid';
import { remove, resolve } from '../util/FileUtil';
import { prepareIos } from '../util/setup/prepareIos';
import { InqueryInputs } from '../util/input/InqueryInputs';

export type SubmitOptions = {
  platform: 'ios' | 'android';
};

export async function submit({ options }: { options: SubmitOptions }) {
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
}

async function submitAndroid() {
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
      'Fastlane',
      () =>
        $$`bundle exec fastlane submit_playstore_review version_name:${OptionHolder.versionName} version_code:${OptionHolder.versionCode}`,
    );
  }
}
async function submitIos() {
  const iosDir = resolve(OptionHolder.projectDir, 'ios');
  const $$ = $({
    verbose: false,
    cwd: iosDir,
  });
  await prepareIos();
  await fastlane();

  async function fastlane() {
    await spinner('Bundler Install', () => $$`bundle install`);
    logger.success('Bundler Install');

    remove(resolve(iosDir, '.xcode.env.local'));

    await spinner(
      'Fastlane',
      () =>
        $$`bundle exec fastlane submit_appstore_review version_name:${OptionHolder.versionName} version_code:${OptionHolder.versionCode}`,
    );
  }
}
