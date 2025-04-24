import { select } from '@inquirer/prompts';
import { prepareAndroid } from '../util/prepareAndroid';
import { setup } from '../util/setup';
import { prepareIos } from '../util/prepareIos';
import { logger } from '../util/logger';
import { OptionHolder } from '../util/OptionHolder';
import { spinner, $ } from 'zx';
import { resolve, remove } from '../util/FileUtil';
import chalk from 'chalk';
import { calculateElapsed } from '../util/calculateElapsed';

export type ReleaseOptions = {
  platform: 'ios' | 'android';
  pod: boolean;
};
const releaseOptions: ReleaseOptions = {
  platform: 'ios',
  pod: true,
};

export async function release() {
  const startTime = Date.now();
  await setup();
  await promptInputs();

  logger.info('Build & Upload Started');
  logger.info(`Version: ${OptionHolder.versionName}(${OptionHolder.versionCode})`);

  if (releaseOptions.platform === 'ios') {
    await releaseIos();
    logger.success(`iOS Release Success ${chalk.bold.inverse(calculateElapsed(startTime))}`);
  } else {
    await releaseAndroid();
    logger.success(`Android Release Success ${chalk.bold.inverse(calculateElapsed(startTime))}`);
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
  if (releaseOptions.platform === 'ios') {
    releaseOptions.pod = await select({
      message: 'Install Cocoapods',
      choices: [
        { name: 'yes', value: true, description: 'Install pods before release' },
        { name: 'no', value: false, description: 'Skip pods install' },
      ],
    });
  }
}

async function releaseIos() {
  const iosDir = resolve(OptionHolder.rootDir, 'ios');
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

    if (releaseOptions.pod) {
      await spinner('Pod Install', () => $$`bundle exec pod install`);
      logger.success('Pod Install');
    }
    remove(resolve(iosDir, '.xcode.env.local'));

    await spinner(
      'Fastlane',
      () =>
        $$`bundle exec fastlane release version_name:${OptionHolder.versionName} version_code:${OptionHolder.versionCode}`,
    );
    logger.success('Deploy to App Store Connect Test Flight');
  }
}
async function releaseAndroid() {
  const $$ = $({
    verbose: false,
    cwd: resolve(OptionHolder.rootDir, 'android'),
  });
  await prepareAndroid();
  await fastlane();

  async function fastlane() {
    await spinner('Bundler Install', () => $$`bundle install`);
    logger.success('Bundler Install');
    await spinner('Bundle AAB', () => $$`./gradlew app:bundleRelease`);
    logger.success('Bundle AAB');
    await spinner(
      'Fastlane Supply',
      () =>
        $$`bundle exec fastlane deploy version_name:${OptionHolder.versionName} version_code:${OptionHolder.versionCode}`,
    );
    logger.success('Deploy to Play Store Internal Testing Track');
  }
}
