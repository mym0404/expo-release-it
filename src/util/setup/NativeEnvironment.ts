import { createRequire } from 'node:module';
import { dirname } from 'node:path';

import semver from 'semver';

import { exist, readJsonSlow, resolve } from '../FileUtil';
import { logger } from '../logger';
import { OptionHolder } from '../OptionHolder';
import { exe } from './execShellScript';

export async function inspectNativeEnvironment() {
  const platform = OptionHolder.input.platform;
  if (platform === 'ios' && process.platform !== 'darwin') {
    throw new Error('Local iOS builds require macOS and Xcode.');
  }
  const require = createRequire(resolve(OptionHolder.projectDir, 'package.json'));
  let expoPackage: string;
  let nativePackage: string;
  try {
    expoPackage = require.resolve('expo/package.json');
    nativePackage = require.resolve('react-native/package.json');
  } catch {
    throw new Error(
      'Install Expo and React Native in the target project before building. CNG projects with Expo SDK 52 or newer are supported.',
    );
  }
  const native = readJsonSlow(nativePackage) as { engines?: { node?: string } };
  if (native.engines?.node && !semver.satisfies(process.version, native.engines.node)) {
    throw new Error(
      `Node ${process.version} at ${process.execPath} does not meet this React Native version's requirement: ${native.engines.node}. Activate a compatible Node before rerunning.`,
    );
  }
  const expoCli = resolve(dirname(expoPackage), 'bin', 'cli');
  if (!exist(expoCli)) throw new Error(`Project-local Expo CLI not found: ${expoCli}`);
  await exe(platform === 'ios' ? 'xcodebuild' : 'java', ['-version'], {
    cwd: OptionHolder.projectDir,
  });
  logger.info(`Node ${process.version}: ${process.execPath}; Expo CLI: ${expoCli}`);
  const env = {
    CI: '1',
    PATH: `${dirname(process.execPath)}:${process.env.PATH ?? ''}`,
  };
  return async function prebuild() {
    await exe(
      process.execPath,
      [expoCli, 'prebuild', '--clean', '--platform', platform, '--no-install'],
      {
        cwd: OptionHolder.projectDir,
        env,
      },
    );
    logger.done('Expo CNG prebuild');
  };
}
