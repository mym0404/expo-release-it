import { logger } from '../util/Logger';
import { parseBinaryVersions } from '../util/VersionUtil';
import { promptCommonInputs } from '../util/promptCommonInputs';
import { select } from '@inquirer/prompts';
import { formatJson } from '@mj-studio/js-util';

export type ReleaseOptions = {
  platform: 'ios' | 'android';
  pod: boolean;
  clear: boolean;
};
const releaseOptions: ReleaseOptions = {
  platform: 'ios',
  pod: true,
  clear: false,
};

export async function release() {
  await promptCommonInputs();
  await parseBinaryVersions();
  await promptInputs();

  logger.info(formatJson(releaseOptions));

  if (releaseOptions.platform === 'ios') {
    await releaseIos();
  } else {
    await releaseAndroid();
  }
}

async function promptInputs() {
  releaseOptions.platform = await select({
    message: 'Platform to release',
    choices: [
      { name: 'ios', value: 'ios', description: 'Release ios' },
      { name: 'android', value: 'android', description: 'Release android' },
    ],
  });
}

async function releaseIos() {}
async function releaseAndroid() {}
