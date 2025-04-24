import { logger } from '../util/logger';
import { select } from '@inquirer/prompts';
import { formatJson } from '@mj-studio/js-util';
import { prepareAndroid } from '../util/prepareAndroid';
import { setup } from '../util/setup';

export type ReleaseOptions = {
  platform: 'ios' | 'android';
  pod: boolean;
};
const releaseOptions: ReleaseOptions = {
  platform: 'ios',
  pod: true,
};

export async function release() {
  await setup();
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
  releaseOptions.pod = await select({
    message: 'Install Cocoapods',
    choices: [
      { name: 'yes', value: true, description: 'Install pods before release' },
      { name: 'no', value: false, description: 'Skip pods install' },
    ],
  });
}

async function releaseIos() {}
async function releaseAndroid() {
  await prepareAndroid();
}
