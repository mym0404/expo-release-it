#!/usr/bin/env zx
/* eslint-disable max-len */
// region ZX Util
import { padZero } from '@mj-studio/js-util';
import fs from 'fs-extra';
import { spinner } from 'zx';

import { ReleaseScriptUtil, VERSION_CODE, VERSION_NAME } from './common/release-util.mjs';

const join = path.join;
const resolve = path.resolve;
const filename = path.basename(__filename);
const cwd = () => process.cwd();
const exit = process.exit;
const _printTag = '🦄' || filename;

function exist(path) {
  return fs.existsSync(path);
}

function isDir(path) {
  return exist(path) && fs.lstatSync(path).isDirectory();
}

function isFile(path) {
  return exist(path) && fs.lstatSync(path).isFile();
}

async function iterateDir(path, fn) {
  if (!isDir(path)) {
    return;
  }

  for (const file of fs.readdirSync(path)) {
    await fn(file);
  }
}

function read(path) {
  return fs.readFileSync(path, { encoding: 'utf8' });
}

// you should require when possible(optimized in js)
function readJsonSlow(path) {
  return fs.readJSONSync(path);
}

function write(p, content) {
  const dir = path.dirname(p);
  if (!exist(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return fs.writeFileSync(p, content);
}

function writeJson(path, json) {
  return write(path, JSON.stringify(json, null, 2));
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
  print(
    `Options: platform: ${platform}, yarn ${yarn === true}, pod: ${pod === true}, clear: ${clear === true}`,
  );
  await ReleaseScriptUtil.init();
  print(`Versions: ${VERSION_NAME}(${VERSION_CODE})`);
  try {
    if (platform !== 'android' && platform !== 'ios') {
      throw new Error('platform should be android or ios');
    }
    await onInit();

    if (platform === 'android') {
      await doAndroid();
    }
    if (platform === 'ios') {
      await doIos();
    }
  } catch (e) {
    printError(e);
  } finally {
    await onDeinit();
  }

  async function onInit() {
    cd(projectRoot);
    if (clear) {
      if (platform === 'android') {
        await $`rm -rf android.tmp`;
      } else {
        await $`rm -rf ios.tmp`;
      }
    }
    if (yarn) {
      await spinner('Install Yarn', () => $`yarn`);
      printSuccess('Install Yarn');
    }
    if (clear) {
      if (exist('android') && platform === 'android') {
        await $`mv android android.tmp`;
      }
      if (exist('ios') && platform === 'ios') {
        await $`mv ios ios.tmp`;
      }
    }
  }
  async function onDeinit() {
    print('Deinit');
    cd(projectRoot);
    if (clear) {
      if (exist('android.tmp') && platform === 'android') {
        await $`rm -rf android`;
        await $`mv android.tmp android`;
      }
      if (exist('ios.tmp') && platform === 'ios') {
        await $`rm -rf ios`;
        await $`mv ios.tmp ios`;
      }
    }
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
