import { parseBinaryVersion } from '../util/parseBinaryVersion';
import { promptCommonInputs } from '../util/promptCommonInputs';
import { execa } from 'execa';
import { throwError } from '../util/throwError';
import { log } from '../util/Log';
import { OptionHolder } from '../util/OptionHolder';
import semver from 'semver';

export type BumpOptions = {
  increment?: 'major' | 'minor' | 'patch';
};

export async function bump({ options }: { options: BumpOptions }) {
  console.log(options);
  await preCheck();
  await promptCommonInputs();
  await parseBinaryVersion();

  log.info(`current version: ${OptionHolder.versionName}(${OptionHolder.versionCode})`);
  const nextVersionName = semver.inc(OptionHolder.versionName, 'patch');
  const nextVersionCode = Number(OptionHolder.versionCode) + 1;
  log.info(`next version: ${nextVersionName}(${nextVersionCode})`);
}

async function preCheck() {
  try {
    // await spinner('gen strings', () => $`yarn l && yarn c`);

    let hasChange = false;
    try {
      await execa`git diff --quiet HEAD`;
    } catch (_) {
      hasChange = true;
    }
    if (hasChange) {
      throwError('Workspace is not clean. Before bump version, you should commit all changes.');
    }

    // await spinner('static checking', () => $`yarn t`);
  } catch (e) {
    throwError('Precheck Failed', e);
  }
}
