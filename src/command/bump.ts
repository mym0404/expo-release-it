import { injectBinaryVersions } from '../util/VersionUtil';
import { throwError } from '../util/throwError';
import { logger } from '../util/logger';
import { OptionHolder } from '../util/OptionHolder';
import semver from 'semver';
import { isDev } from '../util/EnvUtil';
import { $ } from 'zx';
import { setup } from '../util/setup/setup';

export async function bump({ options }: { options: any }) {
  Object.assign(OptionHolder.input, options);
  await preCheck();
  await setup();

  logger.info(`current version: ${OptionHolder.versionName}(${OptionHolder.versionCode})`);
  const nextVersionName = semver.inc(OptionHolder.versionName, 'patch')!;
  const nextVersionCode = Number(OptionHolder.versionCode) + 1 + '';
  logger.info(`next version: ${nextVersionName}(${nextVersionCode})`);

  await injectBinaryVersions({ versionName: nextVersionName, versionCode: nextVersionCode });
  logger.success('Binary versions have been bumped in expo config file');
}

async function preCheck() {
  if (isDev) return;
  try {
    let hasChange = false;
    try {
      await $`git diff --quiet HEAD`;
    } catch (_) {
      hasChange = true;
    }
    if (hasChange) {
      throwError('Workspace is not clean. Before bump version, you should commit all changes.');
    }
  } catch (e) {
    throwError('Precheck Failed', e);
  }
}
