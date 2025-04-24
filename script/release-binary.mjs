#!/usr/bin/env zx
/* eslint-disable max-len */
// region ZX Util
import { padZero } from '@mj-studio/js-util';
import fs from 'fs-extra';
import { spinner } from 'zx';

import { ReleaseScriptUtil, VERSION_CODE, VERSION_NAME } from './common/release-util.mjs';

const resolve = path.resolve;
const filename = path.basename(__filename);
const cwd = () => process.cwd();
const _printTag = '🦄' || filename;

function exist(path) {
  return fs.existsSync(path);
}

function remove(path) {
  if (!exist(path)) {
    return;
  }

  if (fs.lstatSync(path).isDirectory()) {
    return fs.rmSync(path, { force: true, recursive: true });
  } else {
    return fs.rmSync(path, { force: true });
  }
}

function print(...args) {
  echo(chalk.blue(`[${_printTag}]`, ...args));
}

function printSuccess(...args) {
  echo(chalk.bold.bgBlue(`[${_printTag}]`, ...args));
}

function printError(...args) {
  echo(chalk.bold.bgRed(`[${_printTag}]`, ...args));
}

// endregion

const projectRoot = cwd();

const platform = argv['platform'];
const clear = !!argv['clear'];
const yarn = !!argv['yarn'] || clear;
const pod = !!argv['pod'] || clear;

async function main() {
  if (platform === 'android') {
    await doAndroid();
  }
  if (platform === 'ios') {
    await doIos();
  }

  async function doAndroid() {
    const startTime = Date.now();
    try {
      await ReleaseScriptUtil.prepareAndroid();

      await fastlane();
      printSuccess(`Android Build Success ${chalk.bold.inverse(calculateElapsed(startTime))}`);
    } catch (e) {
      printError(`Android Build Failed ${chalk.bold.inverse(calculateElapsed(startTime))}\n\n${e}`);
    }

    async function fastlane() {
      await spinner('Bundler Install', () => $`cd android && bundle install`);
      printSuccess('Bundler Install');
      await spinner('Bundle AAB', () => $`cd android && ./gradlew app:bundleRelease`);
      printSuccess('Bundle AAB');
      await spinner(
        'Fastlane Supply',
        () =>
          $`cd android && bundle exec fastlane deploy version_name:${VERSION_NAME} version_code:${VERSION_CODE}`,
      );
      printSuccess('Deploy to Play Store Internal Testing Track');
    }
  }

  async function doIos() {
    const startTime = Date.now();

    await ReleaseScriptUtil.prepareIos();

    if (pod) {
      await spinner('Pod Install', () => $`yarn pod`);
      printSuccess('Pod Install');
    }

    try {
      await fastlane();
      printSuccess(`iOS Build Success ${chalk.bold.inverse(calculateElapsed(startTime))}`);
    } catch (e) {
      printError(`iOS Build Failed ${chalk.bold.inverse(calculateElapsed(startTime))}\n\n${e}`);
    }

    async function fastlane() {
      await spinner('Bundler Install', () => $`cd ios && bundle install`);
      printSuccess('Bundler Install');

      remove(resolve('ios', '.xcode.env.local'));
      $.env.MATCH_PASSWORD = 'roqkfrhk1!';
      await spinner(
        'Fastlane',
        () =>
          $`cd ios && bundle exec fastlane release version_name:${VERSION_NAME} version_code:${VERSION_CODE}`,
      );
      printSuccess('Deploy to App Store Connect Test Flight');
    }
  }

  function calculateElapsed(t) {
    let seconds = Math.floor((Date.now() - t) / 1000);
    const minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    return `${minutes}:${padZero(seconds)}`;
  }
}
main();
