import { select } from '@inquirer/prompts';
import { prepareAndroid } from '../util/prepareAndroid';
import { setup } from '../util/setup';
import { prepareIos } from '../util/prepareIos';
import { logger } from '../util/logger';
import { OptionHolder } from '../util/OptionHolder';

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

  logger.info(`Version: ${OptionHolder.versionName}(${OptionHolder.versionCode})`);
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
  if (releaseOptions.platform === 'ios') {
    releaseOptions.pod = await select({
      message: 'Install Cocoapods',
      choices: [
        { name: 'yes', value: true, description: 'Install pods before release' },
        { name: 'no', value: false, description: 'Skip pods install' },
      ],
    });
  }
}

async function releaseIos() {
  await prepareIos();
}
async function releaseAndroid() {
  await prepareAndroid();
}
