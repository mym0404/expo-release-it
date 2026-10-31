import chalk from 'chalk';

import { calculateElapsed } from '../util/calculateElapsed';
import { runFastlane } from '../util/FastlaneOption';
import { InqueryInputs } from '../util/input/InqueryInputs';
import { logger } from '../util/logger';
import { OptionHolder } from '../util/OptionHolder';
import { prepareFastlane } from '../util/setup/prepareFastlane';
import { setup } from '../util/setup/setup';

export async function submit({ options }: { options: any }) {
  Object.assign(OptionHolder.input, options);
  const startTime = Date.now();
  await setup();
  await promptInputs();

  logger.info('Submit Started');

  await runFastlane(await prepareFastlane(), 'submit');
  logger.success(
    `${OptionHolder.input.platform} Submit ${chalk.bold.inverse(calculateElapsed(startTime))}`,
  );
}

async function promptInputs() {
  await InqueryInputs.platform();
  await InqueryInputs.uploadMetadata();
  await InqueryInputs.uploadScreenshot();
}
