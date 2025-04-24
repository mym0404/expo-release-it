import fs from 'fs-extra';
import { OptionHolder } from './OptionHolder';
import * as path from 'path';
import { throwError } from './throwError';

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

    OptionHolder.versionName = VERSION_NAME;
    OptionHolder.versionCode = VERSION_CODE;
  }

  async function parseFromJsonConfigFile(filename: string) {
    const filePath = path.resolve(OptionHolder.rootDir, filename);
    const json = JSON.parse(await fs.readFile(filePath, { encoding: 'utf-8' }));

    const versionName = json.expo.version;

    const VERSION_NAME = /const VERSION_NAME = '(.*?)';?/.exec(content)?.[1];
    const VERSION_CODE = /const VERSION_CODE = (.*?);?/.exec(content)?.[1];

    if (!VERSION_NAME) {
      throwError('cannot parse version name');
    }
    if (!VERSION_CODE) {
      throwError('cannot parse version code');
    }

    OptionHolder.versionName = VERSION_NAME;
    OptionHolder.versionCode = VERSION_CODE;
  }
}
