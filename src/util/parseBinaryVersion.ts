import fs from 'fs-extra';
import { OptionHolder } from './OptionHolder';
import * as path from 'path';
import { throwError } from './throwError';
import semver from 'semver';

export async function parseBinaryVersion() {
  const files = await fs.readdir(OptionHolder.rootDir);

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
    const filePath = path.resolve(OptionHolder.rootDir, filename);
    const content = await fs.readFile(filePath, { encoding: 'utf-8' });

    const VERSION_NAME = /const VERSION_NAME = '(.*?)';?/.exec(content)?.[1];
    const VERSION_CODE = /const VERSION_CODE = (.*?);?/.exec(content)?.[1];

    if (!VERSION_NAME) {
      throwError('cannot parse version name');
    }
    if (!VERSION_CODE) {
      throwError('cannot parse version code');
    }

    if (semver.valid(VERSION_NAME)) {
      throwError('VERSION_NAME is not a valid semver format');
    }

    OptionHolder.versionName = VERSION_NAME;
    OptionHolder.versionCode = VERSION_CODE;
  }

  async function parseFromJsonConfigFile(filename: string) {
    const filePath = path.resolve(OptionHolder.rootDir, filename);
    const json = JSON.parse(await fs.readFile(filePath, { encoding: 'utf-8' }));

    const versionName = json.expo?.version + '';
    const iosVersionCode = json.expo?.ios?.buildNumber + '';
    const androidVersionCode = json.expo?.android?.versionCode + '';

    if (!/\d+/.test(iosVersionCode)) {
      throwError('app.json expo.ios.buildNumber is not an integer');
    }

    if (!/\d+/.test(androidVersionCode)) {
      throwError('app.json expo.android.versionCode is not an integer');
    }

    if (iosVersionCode !== androidVersionCode) {
      throwError('app.json expo.ios.buildNumber is not equal with expo.android.versionCode');
    }

    if (semver.valid(versionName)) {
      throwError('VERSION_NAME is not a valid semver format');
    }

    OptionHolder.versionName = versionName;
    OptionHolder.versionCode = iosVersionCode;
  }
}
