#!/usr/bin/env zx
/* eslint-disable max-len */
// region ZX Util
import { padZero } from '@mj-studio/js-util';
import fs from 'fs-extra';

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

function printError(...args) {
  echo(chalk.bold.bgRed(`[${_printTag}]`, ...args));
}

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
