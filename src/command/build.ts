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
import { InqueryInputs } from '../util/input/InqueryInputs';

export type BuildOptions = {
  platform: 'ios' | 'android';
  androidOutput: 'apk' | 'aab';
  pod: boolean;
};

export async function build({ options }: { options: BuildOptions }) {
  Object.assign(OptionHolder.input, options);
  const startTime = Date.now();
  await setup();
  await promptInputs();

  logger.info('Build Started');
  logger.info(`Version: ${OptionHolder.versionName}(${OptionHolder.versionCode})`);

  if (OptionHolder.input.platform === 'ios') {
    await buildIos();
    logger.success(`iOS Build ${chalk.bold.inverse(calculateElapsed(startTime))}`);
  } else {
    await buildAndroid();
    logger.success(`Android Build ${chalk.bold.inverse(calculateElapsed(startTime))}`);
  }
}

async function promptInputs() {
  await InqueryInputs.platform();
  await InqueryInputs.podinstall();
  await InqueryInputs.androidBuildOutput();
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

    if (OptionHolder.input.pod) {
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

    if (OptionHolder.input.androidOutput === 'aab') {
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
