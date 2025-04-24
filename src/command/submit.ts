import { setup } from '../util/setup';
import { select } from '@inquirer/prompts';
import { logger } from '../util/logger';
import { OptionHolder } from '../util/OptionHolder';
import chalk from 'chalk';
import { calculateElapsed } from '../util/calculateElapsed';
import { spinner, $ } from 'zx';
import { prepareAndroid } from '../util/prepareAndroid';
import { remove, resolve } from '../util/FileUtil';
import { prepareIos } from '../util/prepareIos';

export type SubmitOptions = {
  platform: 'ios' | 'android';
};
const releaseOptions: SubmitOptions = {
  platform: 'ios',
};

export async function submit() {
  const startTime = Date.now();
  await setup();
  await promptInputs();

  logger.info('Submit Started');
  logger.info(`Version: ${OptionHolder.versionName}(${OptionHolder.versionCode})`);

  if (releaseOptions.platform === 'ios') {
    await submitIos();
    logger.success(`Appstore Review Submitted ${chalk.bold.inverse(calculateElapsed(startTime))}`);
  } else {
    await submitAndroid();
    logger.success(`Playstore Review Submitted ${chalk.bold.inverse(calculateElapsed(startTime))}`);
  }
}

async function promptInputs() {
  releaseOptions.platform = await select({
    message: 'Platform to release',
    choices: [
      { name: 'ios', value: 'ios', description: 'Release ios' },
      { name: 'android', value: 'android', description: 'Release android' },
    ],
  });
}

async function submitAndroid() {
  const $$ = $({
    verbose: false,
    cwd: resolve(OptionHolder.rootDir, 'android'),
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
  const iosDir = resolve(OptionHolder.rootDir, 'ios');
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
