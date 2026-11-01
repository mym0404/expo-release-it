import { dirname } from 'node:path';

import chalk from 'chalk';

import { calculateElapsed } from '../util/calculateElapsed';
import { runFastlane } from '../util/FastlaneOption';
import { copy, exist, relativePath, remove, resolve } from '../util/FileUtil';
import { InqueryInputs } from '../util/input/InqueryInputs';
import { logger } from '../util/logger';
import { OptionHolder } from '../util/OptionHolder';
import { exe } from '../util/setup/execShellScript';
import { inspectNativeEnvironment } from '../util/setup/NativeEnvironment';
import { androidSigningEnvironment, prepareAndroid } from '../util/setup/prepareAndroid';
import { prepareFastlane } from '../util/setup/prepareFastlane';
import { prepareIos } from '../util/setup/prepareIos';
import { inspectRubyEnvironment } from '../util/setup/RubyEnvironment';
import { setup } from '../util/setup/setup';

export async function build({ options }: { options: any }) {
  Object.assign(OptionHolder.input, options);
  const startTime = Date.now();
  await setup();
  await InqueryInputs.platform();
  await InqueryInputs.androidBuildOutput();
  const isIos = OptionHolder.input.platform === 'ios';
  if (!isIos && OptionHolder.input.sign === false)
    throw new Error(
      '--no-sign is only supported for iOS. Android release builds require a signing key.',
    );
  const ruby = await inspectRubyEnvironment({ needsPods: isIos });
  const signingEnv = isIos ? {} : androidSigningEnvironment();
  const prebuild = await inspectNativeEnvironment();
  await prepareFastlane(ruby);
  let artifact: string;
  if (isIos) {
    await prepareIos({ ruby, prebuild });
    await runFastlane(ruby, 'build');
    artifact = resolve(
      OptionHolder.resourcesDir,
      'output',
      'ios',
      OptionHolder.input.sign === false ? 'app.xcarchive' : 'app.ipa',
    );
  } else {
    await prepareAndroid(prebuild);
    const isAab = OptionHolder.input.androidOutput === 'aab';
    await exe('./gradlew', [isAab ? 'app:bundleRelease' : 'app:assembleRelease'], {
      cwd: resolve(OptionHolder.projectDir, 'android'),
      env: { ...signingEnv, PATH: `${dirname(process.execPath)}:${process.env.PATH ?? ''}` },
    });
    // aab: app/build/outputs/bundle/release/app-release.aab
    // apk: app/build/outputs/apk/release/app-release.apk
    const output = isAab ? 'aab' : 'apk';
    const outputDir = resolve(OptionHolder.resourcesDir, 'output', 'android', output);
    const buildOutput = resolve(
      OptionHolder.projectDir,
      'android',
      'app',
      'build',
      'outputs',
      isAab ? 'bundle' : 'apk',
      'release',
    );
    const binary = resolve(buildOutput, `app-release.${output}`);
    if (!exist(binary)) throw new Error(`Release build output is missing: ${binary}`);
    remove(outputDir);
    copy(buildOutput, outputDir);
    artifact = resolve(outputDir, `app-release.${output}`);
  }
  if (!exist(artifact)) throw new Error(`Expected build artifact was not generated: ${artifact}`);
  logger.success(`artifact generated: ${relativePath(OptionHolder.projectDir, artifact)}`);
  logger.success(
    `${isIos ? 'iOS' : 'Android'} Build ${chalk.bold.inverse(calculateElapsed(startTime))}`,
  );
}
