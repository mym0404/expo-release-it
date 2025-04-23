#!/usr/bin/env zx
/* eslint-disable max-len */
// region ZX Util
import fs from 'fs-extra';
import { spinner } from 'zx';

import { ReleaseScriptUtil, VERSION_CODE, VERSION_NAME } from './common/release-util.mjs';

const resolve = path.resolve;
const filename = path.basename(__filename);
const exit = process.exit;
const _printTag = '' || filename;

function exist(path) {
  return fs.existsSync(path);
}

function read(path) {
  return fs.readFileSync(path, { encoding: 'utf8' });
}

function write(p, content) {
  const dir = path.dirname(p);
  if (!exist(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return fs.writeFileSync(p, content);
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
  exit(1);
}

// endregion

const platform = argv['platform'];
async function main() {
  print(`Options: platform: ${platform}`);
  await ReleaseScriptUtil.init();
  print(`Versions: ${VERSION_NAME}(${VERSION_CODE})`);
  if (platform !== 'android' && platform !== 'ios') {
    printError('platform should be android or ios');
  }
  try {
    if (platform === 'android') {
      await doAndroid();
    }
    if (platform === 'ios') {
      await doIos();
    }
  } catch (e) {
    printError(e);
  }
}
main();

async function doAndroid() {
  await ReleaseScriptUtil.prepareAndroid();
  await fastlane();

  async function fastlane() {
    await spinner('Bundler Install', () => $`cd android && bundle install`);
    printSuccess('Bundler Install');

    await spinner(
      'Fastlane',
      () =>
        $`cd android && bundle exec fastlane submit_playstore_review version_name:${VERSION_NAME} version_code:${VERSION_CODE}`,
    );
    printSuccess('Playstore Review Submitted');
  }
}
async function doIos() {
  await ReleaseScriptUtil.prepareIos();
  await fastlane();

  async function fastlane() {
    await spinner('Bundler Install', () => $`cd ios && bundle install`);
    printSuccess('Bundler Install');

    remove(resolve('ios', '.xcode.env.local'));
    await spinner(
      'Fastlane',
      () =>
        $`cd ios && bundle exec fastlane submit_appstore_review version_name:${VERSION_NAME} version_code:${VERSION_CODE}`,
    );
    printSuccess('Appstore Review Submitted');
  }
}
