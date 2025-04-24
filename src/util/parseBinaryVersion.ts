import fs from 'fs-extra';
import { OptionHolder } from './OptionHolder';
import * as path from 'path';
import { throwError } from './throwError';

export async function parseBinaryVersion() {
  const dirs = await fs.readdir(OptionHolder.rootDir);

  if (!dirs.includes('app.config.ts')) {
    throwError('app.config.ts is not placed');
  }

  const filePath = path.resolve(OptionHolder.rootDir, 'app.config.ts');

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
