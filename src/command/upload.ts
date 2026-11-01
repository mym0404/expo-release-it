import chalk from 'chalk';

import { calculateElapsed } from '../util/calculateElapsed';
import { runFastlane } from '../util/FastlaneOption';
import { InqueryInputs } from '../util/input/InqueryInputs';
import { logger } from '../util/logger';
import { OptionHolder } from '../util/OptionHolder';
import { prepareFastlane } from '../util/setup/prepareFastlane';
import { setup } from '../util/setup/setup';

export async function upload({ options }: { options: any }) {
  Object.assign(OptionHolder.input, options);
  const startTime = Date.now();
  await setup();
  await promptInputs();

  logger.info('Upload Testing Track Started');

  await runFastlane(await prepareFastlane(), 'upload');
  logger.success(
    `${OptionHolder.input.platform} Upload ${chalk.bold.inverse(calculateElapsed(startTime))}`,
  );
}

async function promptInputs() {
  await InqueryInputs.platform();
  await InqueryInputs.androidBuildOutput();
  if (OptionHolder.input.platform !== 'ios') {
    await InqueryInputs.uploadMetadata();
    await InqueryInputs.uploadScreenshot();
  }
  if (
    OptionHolder.input.platform === 'ios' &&
    (OptionHolder.input.uploadMetadata || OptionHolder.input.uploadScreenshot)
  ) {
    logger.warn("ios upload command doesn't support uploading metadatas and screenshots");
  }
}
