import { parseBinaryVersions, injectBinaryVersions } from '../util/VersionUtil';
import { promptCommonInputs } from '../util/promptCommonInputs';
import { throwError } from '../util/throwError';
import { logger } from '../util/logger';
import { OptionHolder } from '../util/OptionHolder';
import semver from 'semver';
import { isDev } from '../util/EnvUtil';
import { $ } from 'zx';

export type BumpOptions = {};

export async function bump({}: { options: BumpOptions }) {
  await preCheck();
  await promptCommonInputs();
  await parseBinaryVersions();

  logger.info(`current version: ${OptionHolder.versionName}(${OptionHolder.versionCode})`);
  const nextVersionName = semver.inc(OptionHolder.versionName, 'patch')!;
  const nextVersionCode = Number(OptionHolder.versionCode) + 1 + '';
  logger.info(`next version: ${nextVersionName}(${nextVersionCode})`);

  await injectBinaryVersions({ versionName: nextVersionName, versionCode: nextVersionCode });
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
