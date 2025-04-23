#!/usr/bin/env zx
/* eslint-disable max-len */
// region ZX Util
import fs from 'fs-extra';
import { spinner } from 'zx';

import { ReleaseScriptUtil, VERSION_CODE, VERSION_NAME } from './common/release-util.mjs';

const join = path.join;
const resolve = path.resolve;
const filename = path.basename(__filename);
const cwd = () => process.cwd();
const exit = process.exit;
const _printTag = '' || filename;

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

function addLine(str, added, backward = false) {
  if (backward) {
    return added + '\n' + str;
  } else {
    return str + '\n' + added;
  }
}

function addLineToFile(path, added, backward = false) {
  return write(path, addLine(read(path), added, backward));
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

function asrt(condition, ...args) {
  if (!condition) {
    echo(chalk.bold.bgRed(`[${_printTag}]`, ...args));
    exit(1);
  }
}

const tKey = {};

function measureBegin(name = '⏳') {
  print(`=======Start [${name}=======`);
  tKey[name] = Date.now();
}

function measureEnd(name = '⏳') {
  print(
    `=======End [${name}]==[${(Date.now() - tKey[name]).toLocaleString().split('.')[0]}ms]=======`,
  );
}

async function input(message) {
  if (message) {
    return question(message + ': ');
  } else {
    return stdin();
  }
}

async function fixLint(path) {
  await $`yarn prettier ${path} --write --log-level silent`;
  await $`yarn eslint ${path} --fix --quiet --max-warnings 100`;
}

const HEADING = `// @ts-nocheck
/* eslint-disable */
/**
 * Generated file. Don't modify manually.
 */
 `;

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
