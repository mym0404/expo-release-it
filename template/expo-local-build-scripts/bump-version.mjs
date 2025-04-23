#!/usr/bin/env zx
/* eslint-disable max-len */
// region ZX Util
import { padZero } from '@mj-studio/js-util';
import fs from 'fs-extra';

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
let VERSION_NAME = '';
let VERSION_CODE = '';

async function preCheck() {
  try {
    // await spinner('gen strings', () => $`yarn l && yarn c`);

    let hasChange = false;
    try {
      await $`git diff --quiet HEAD`;
    } catch (_) {
      hasChange = true;
    }
    if (hasChange) {
      printError('Workspace is not clean. Before bump version, you should commit all changes.');
      exit(1);
    }

    // await spinner('static checking', () => $`yarn t`);
  } catch (e) {
    printError('Precheck Failed', e);
  }
}

async function main() {
  await preCheck();

  const p = resolve('app.config.ts');
  let content = read(p);
  VERSION_NAME = /const VERSION_NAME = '(.*?)';/.exec(content)[1];
  VERSION_CODE = /const VERSION_CODE = (.*?);/.exec(content)[1];

  const [major, minor, patch] = VERSION_NAME.split('.');
  const newVersion = `${major}.${minor}.${+patch + 1}`;
  //1000024
  const newVersionCode = `${major}${padZero(+minor, 3)}${padZero(+patch + 1, 3)}`;

  content = content.replace(
    /const VERSION_NAME = '(.*?)';/,
    `const VERSION_NAME = '${newVersion}';`,
  );
  content = content.replace(
    /const VERSION_CODE = (.*?);/,
    `const VERSION_CODE = ${newVersionCode};`,
  );
  write(p, content);

  await $`git add app.config.ts`;
  await $`git commit -m "chore: bump version: ${newVersion}"`;
  await $`git tag "${newVersion}"`;
  await $`git push --tags`;
}
main();
