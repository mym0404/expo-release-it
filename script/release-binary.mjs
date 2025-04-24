#!/usr/bin/env zx
/* eslint-disable max-len */
// region ZX Util
import { padZero } from '@mj-studio/js-util';
import fs from 'fs-extra';

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
  if (platform === 'ios') {
    await doIos();
  }

  async function doIos() {}

  function calculateElapsed(t) {
    let seconds = Math.floor((Date.now() - t) / 1000);
    const minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    return `${minutes}:${padZero(seconds)}`;
  }
}
main();
