#!/usr/bin/env zx
/* eslint-disable max-len */
// region ZX Util
import fs from 'fs-extra';
import { spinner } from 'zx';

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
}

function asrt(condition, ...args) {
  if (!condition) {
    echo(chalk.bold.bgRed(`[${_printTag}]`, ...args));
    exit(1);
  }
}

// endregion

const projectRoot = cwd();
export let VERSION_NAME = '';
export let VERSION_CODE = '';

async function init() {
  const content = read(resolve(projectRoot, 'app.config.ts'));

  VERSION_NAME = /const VERSION_NAME = '(.*?)';/.exec(content)[1];
  VERSION_CODE = /const VERSION_CODE = (.*?);/.exec(content)[1];
}
async function prepareAndroid() {
  await spinner('Prebuild Android', () => $`expo prebuild -p android --no-install`);
  await remove('android/fastlane');
  await iterateDir('fastlane-android', async (file) => {
    const filePath = path.resolve('fastlane-android', file);
    await $`cp -r ${filePath} android/${file}`;
  });
  printSuccess('Inject Android Fastlane files');
  await replaceAndroidSigningConfig();

  async function replaceAndroidSigningConfig() {
    const buildGradlePath = resolve('android', 'app', 'build.gradle');
    const content = read(buildGradlePath).replace(
      /signingConfigs.*?{.*?debug.*?{.*?}.*?}/s,
      `
      signingConfigs {
        debug {
            storeFile file('${resolve(projectRoot, 'key', 'android_release_keystore.jks')}')
            storePassword '{{android_keystore_store_password}}'
            keyAlias '{{android_keystore_key_alias}}'
            keyPassword '{{android_keystore_key_password}}'
        }
      }
      `,
    );
    write(buildGradlePath, content);
    printSuccess('Replace Android Signing Config');
  }
}

async function prepareIos() {
  await spinner('Prebuild iOS', () => $`expo prebuild -p ios --no-install`);
  await remove('ios/fastlane');
  await iterateDir('fastlane-ios', async (file) => {
    const filePath = path.resolve('fastlane-ios', file);
    await $`rm -rf ios/${file} && cp -r ${filePath} ios/${file}`;
  });
  printSuccess('Inject iOS Fastlane files');
}

export const ReleaseScriptUtil = {
  prepareAndroid,
  prepareIos,
  init,
};
