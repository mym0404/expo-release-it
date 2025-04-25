import { select } from '@inquirer/prompts';
import { prepareAndroid } from '../util/setup/prepareAndroid';
import { setup } from '../util/setup/setup';
import { prepareIos } from '../util/setup/prepareIos';
import { logger } from '../util/logger';
import { OptionHolder } from '../util/OptionHolder';
import { spinner, $ } from 'zx';
import { resolve, remove } from '../util/FileUtil';
import chalk from 'chalk';
import { calculateElapsed } from '../util/calculateElapsed';
import { isWin } from '../util/EnvUtil';

export type BuildOptions = {
  platform: 'ios' | 'android';
  pod: boolean;
};

export async function build({ options }: { options: BuildOptions }) {
  Object.assign(OptionHolder.build, options);
  const startTime = Date.now();
  await setup();
  await promptInputs();

  logger.info('Build Started');
  logger.info(`Version: ${OptionHolder.versionName}(${OptionHolder.versionCode})`);

  if (OptionHolder.build.platform === 'ios') {
    await buildIos();
    logger.success(`iOS Build ${chalk.bold.inverse(calculateElapsed(startTime))}`);
  } else {
    await buildAndroid();
    logger.success(`Android Build ${chalk.bold.inverse(calculateElapsed(startTime))}`);
  }
}

async function promptInputs() {
  if (!OptionHolder.build.platform) {
    OptionHolder.build.platform = await select({
      message: 'Platform to release',
      choices: [
        { name: 'ios', value: 'ios', description: 'Release ios' },
        { name: 'android', value: 'android', description: 'Release android' },
      ],
    });
  }
  if (OptionHolder.build.platform === 'ios') {
    OptionHolder.build.pod = await select({
      message: 'Install Cocoapods',
      choices: [
        { name: 'yes', value: true, description: 'Install pods before release' },
        { name: 'no', value: false, description: 'Skip pods install' },
      ],
    });
  }
}

async function buildIos() {
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

    if (OptionHolder.build.pod) {
      await spinner('Pod Install', () => $$`bundle exec pod install`);
      logger.success('Pod Install');
    }
    remove(resolve(iosDir, '.xcode.env.local'));

    await spinner(
      'Fastlane',
      () =>
        $$`bundle exec fastlane build version_name:${OptionHolder.versionName} version_code:${OptionHolder.versionCode}`,
    );
  }
}
async function buildAndroid() {
  const $$ = $({
    verbose: false,
    cwd: resolve(OptionHolder.rootDir, 'android'),
  });
  await prepareAndroid();
  await fastlane();

  async function fastlane() {
    await spinner('Bundler Install', () => $$`bundle install`);
    await spinner('Bundle AAB', () => $$`${isWin ? 'gradle.bat' : './gradlew'} app:bundleRelease`);
  }
}
