import { select } from '@inquirer/prompts';
import { prepareAndroid } from '../util/setup/prepareAndroid';
import { setup } from '../util/setup/setup';
import { prepareIos } from '../util/setup/prepareIos';
import { logger } from '../util/logger';
import { OptionHolder } from '../util/OptionHolder';
import { spinner, $ } from 'zx';
import { resolve, remove, copy, relativePath } from '../util/FileUtil';
import chalk from 'chalk';
import { calculateElapsed } from '../util/calculateElapsed';
import { isWin } from '../util/EnvUtil';
import { formatJson } from '@mj-studio/js-util';

export type BuildOptions = {
  platform: 'ios' | 'android';
  androidOutput: 'apk' | 'aab';
  pod: boolean;
};

export async function build({ options }: { options: BuildOptions }) {
  Object.assign(OptionHolder.build, options);
  logger.dim(formatJson(OptionHolder.build));
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

  // ios
  if (OptionHolder.build.platform === 'ios') {
    OptionHolder.build.pod = await select({
      message: 'Install Cocoapods',
      choices: [
        { name: 'yes', value: true, description: 'Install pods before release' },
        { name: 'no', value: false, description: 'Skip pods install' },
      ],
    });
  }

  // android
  if (OptionHolder.build.platform === 'android') {
    if (!OptionHolder.build.androidOutput) {
      OptionHolder.build.androidOutput = await select({
        message: 'Android Output',
        choices: [
          { name: 'aab', value: 'aab', description: 'Build as App bundle' },
          { name: 'apk', value: 'apk', description: 'Build as APK' },
        ],
      });
    }
  }
}

async function buildIos() {
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
  const androidDir = resolve(OptionHolder.projectDir, 'android');
  const $$ = $({
    verbose: false,
    cwd: androidDir,
  });
  await prepareAndroid();
  await fastlane();

  async function fastlane() {
    await spinner('Bundler Install', () => $$`bundle install`);
    logger.success('Bundler Install');

    let buildOutputDir: string;
    let outputDir: string;

    if (OptionHolder.build.androidOutput === 'aab') {
      // aab: app/build/outputs/bundle/release/app-release.aab
      await spinner(
        'Bundle AAB',
        () => $$`${isWin ? 'gradle.bat' : './gradlew'} app:bundleRelease`,
      );
      buildOutputDir = resolve(androidDir, 'app', 'build', 'outputs', 'bundle', 'release');
      outputDir = resolve(OptionHolder.outputOfInitDir, 'output', 'android', 'aab');
    } else {
      // apk: app/build/outputs/apk/release/app-release.apk
      await spinner(
        'Bundle APK',
        () => $$`${isWin ? 'gradle.bat' : './gradlew'} app:assembleRelease`,
      );
      buildOutputDir = resolve(androidDir, 'app', 'build', 'outputs', 'apk', 'release');
      outputDir = resolve(OptionHolder.outputOfInitDir, 'output', 'android', 'apk');
    }

    remove(outputDir);
    copy(buildOutputDir, outputDir);

    logger.success(`artifact generated: ${relativePath(OptionHolder.projectDir, outputDir)}`);
  }
}
