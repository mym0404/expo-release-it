import { parseBinaryVersion } from '../util/parseBinaryVersion';
import { promptCommonInputs } from '../util/promptCommonInputs';
import { execa } from 'execa';
import { throwError } from '../util/throwError';

export async function bump() {
  await preCheck();
  await promptCommonInputs();
  await parseBinaryVersion();
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
