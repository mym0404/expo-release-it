import { prepareAndroid } from '../util/setup/prepareAndroid';
import { setup } from '../util/setup/setup';
import { prepareIos } from '../util/setup/prepareIos';
import { logger } from '../util/logger';
import { OptionHolder } from '../util/OptionHolder';
import { resolve, remove, copy, relativePath } from '../util/FileUtil';
import chalk from 'chalk';
import { calculateElapsed } from '../util/calculateElapsed';
import { isWin } from '../util/EnvUtil';
import { InqueryInputs } from '../util/input/InqueryInputs';
import { getIosFastlaneOptions } from '../util/FastlaneOption';
import { spinner } from '../util/spinner';
import { exe } from '../util/setup/execShellScript';

export async function build({ options }: { options: any }) {
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
  const exeEnv = exe({
    cwd: iosDir,
    env: {
      MATCH_PASSWORD: OptionHolder.keyholderMap.ios_match_password,
    },
  });
  await prepareIos();
  await fastlane();

  async function fastlane() {
    if (OptionHolder.input.pod) {
      await spinner('Pod Install', exeEnv('bundle', ['exec', 'pod', 'install']));
    }
    remove(resolve(iosDir, '.xcode.env.local'));

    await exeEnv`bundle exec fastlane build ${getIosFastlaneOptions()}`;
  }
}
async function buildAndroid() {
  const androidDir = resolve(OptionHolder.projectDir, 'android');
  const exeEnv = exe({
    cwd: androidDir,
  });
  await prepareAndroid();
  await fastlane();

  async function fastlane() {
    let buildOutputDir: string;
    let outputDir: string;

    if (OptionHolder.input.androidOutput === 'aab') {
      // aab: app/build/outputs/bundle/release/app-release.aab
      await spinner('Bundle AAB', exeEnv`${isWin ? 'gradle.bat' : './gradlew'} app:bundleRelease`);
      buildOutputDir = resolve(androidDir, 'app', 'build', 'outputs', 'bundle', 'release');
      outputDir = resolve(OptionHolder.outputOfInitDir, 'output', 'android', 'aab');
    } else {
      // apk: app/build/outputs/apk/release/app-release.apk
      await spinner(
        'Bundle APK',
        exeEnv`${isWin ? 'gradle.bat' : './gradlew'} app:assembleRelease`,
      );
      buildOutputDir = resolve(androidDir, 'app', 'build', 'outputs', 'apk', 'release');
      outputDir = resolve(OptionHolder.outputOfInitDir, 'output', 'android', 'apk');
    }

    remove(outputDir);
    copy(buildOutputDir, outputDir);

    logger.success(`artifact generated: ${relativePath(OptionHolder.projectDir, outputDir)}`);
  }
}
