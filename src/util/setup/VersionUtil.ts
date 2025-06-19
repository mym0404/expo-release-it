import { padZero } from '@mj-studio/js-util';
import semver from 'semver';
import { read, readdir, readJsonSlow, resolve, write, writeJson } from '../FileUtil';
import { OptionHolder } from '../OptionHolder';
import { throwError } from '../throwError';

const versionNameRegex = () => /const\s+VERSION_NAME\s*?=\s*?['"]([\d.]*?)['"]\s*?;?/;
const versionCodeRegex = () => /const\s+VERSION_CODE\s*?=\s*?(\d+)\s*?;?/;

export async function parseBinaryVersions() {
  const files = readdir(OptionHolder.projectDir);

  const jsConfigFiles = ['app.config.ts', 'app.config.js', 'app.config.cjs', 'app.config.mjs'];
  const jsonConfigFile = 'app.json';

  for (const jsConfigFile of jsConfigFiles) {
    if (files.includes(jsConfigFile)) {
      await parseFromJsConfigFile(jsConfigFile);
      return;
    }
  }

  if (files.includes(jsonConfigFile)) {
    await parseFromJsonConfigFile(jsonConfigFile);
    return;
  }

  throwError('expo config file not found');

  async function parseFromJsConfigFile(filename: string) {
    const filePath = resolve(OptionHolder.projectDir, filename);
    const content = read(filePath);

    const VERSION_NAME = versionNameRegex().exec(content)?.[1];
    const VERSION_CODE = versionCodeRegex().exec(content)?.[1];

    if (!VERSION_NAME) {
      throwError('cannot parse version name');
    }
    if (!VERSION_CODE) {
      throwError('cannot parse version code');
    }

    if (!semver.valid(VERSION_NAME)) {
      throwError('VERSION_NAME is not a valid semver format');
    }

    OptionHolder.versionName = VERSION_NAME;
    OptionHolder.versionCode = VERSION_CODE;
  }

  async function parseFromJsonConfigFile(filename: string) {
    const filePath = resolve(OptionHolder.projectDir, filename);
    const json = readJsonSlow(filePath);

    const versionName = `${json.expo?.version}`;
    const iosVersionCode = `${json.expo?.ios?.buildNumber}`;
    const androidVersionCode = `${json.expo?.android?.versionCode}`;

    if (!/\d+/.test(iosVersionCode)) {
      throwError('app.json expo.ios.buildNumber is not an integer');
    }

    if (!/\d+/.test(androidVersionCode)) {
      throwError('app.json expo.android.versionCode is not an integer');
    }

    if (iosVersionCode !== androidVersionCode) {
      throwError('app.json expo.ios.buildNumber is not equal with expo.android.versionCode');
    }

    if (!semver.valid(versionName)) {
      throwError('VERSION_NAME is not a valid semver format');
    }

    OptionHolder.versionName = versionName;
    OptionHolder.versionCode = iosVersionCode;
  }
}

export async function injectBinaryVersions({
  versionCode,
  versionName,
}: {
  versionName: string;
  versionCode: string;
}) {
  const files = readdir(OptionHolder.projectDir);

  const jsConfigFiles = ['app.config.ts', 'app.config.js', 'app.config.cjs', 'app.config.mjs'];
  const jsonConfigFile = 'app.json';

  for (const jsConfigFile of jsConfigFiles) {
    if (files.includes(jsConfigFile)) {
      await injectToJsConfigFile(jsConfigFile);
      return;
    }
  }

  if (files.includes(jsonConfigFile)) {
    await injectToJsonConfigFile(jsonConfigFile);
    return;
  }

  throwError('expo config file not found');

  async function injectToJsConfigFile(filename: string) {
    const filePath = resolve(OptionHolder.projectDir, filename);
    let content = read(filePath);

    content = content.replace(versionNameRegex(), `const VERSION_NAME = '${versionName}';`);
    content = content.replace(versionCodeRegex(), `const VERSION_CODE = ${versionCode};`);

    write(filePath, content);
  }

  async function injectToJsonConfigFile(filename: string) {
    const filePath = resolve(OptionHolder.projectDir, filename);
    const json = readJsonSlow(filePath);

    json.expo.version = versionName;
    json.expo.ios.buildNumber = versionCode;
    json.expo.android.versionCode = +versionCode;

    writeJson(filePath, json);
  }
}

export function checkVersionCodeIsTiedWithVersionName(
  versionName: string,
  versionCode: string,
): boolean {
  if (!semver.valid(versionName)) return false;
  return generateVersionCodeTiedWithVersionName(versionName) === versionCode;
}

export function generateVersionCodeTiedWithVersionName(versionName: string) {
  if (!semver.valid(versionName))
    throwError(
      'Version Name is not a valid semver format when running `generateVersionCodeTiedWithVersionName`',
    );
  const major = semver.major(versionName);
  const minor = semver.minor(versionName);
  const patch = semver.patch(versionName);

  return `${major}${padZero(minor, 3)}${padZero(patch, 3)}`;
}
